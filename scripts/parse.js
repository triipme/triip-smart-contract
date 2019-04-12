const fs = require("fs");
const csv = require("csv");
const got = require("got");
const config = require("./config.js");
const BigNumber = require("bignumber.js");
const EthereumUtil = require("ethereumjs-util");
const Web3 = require("Web3");
var EthereumTx = require("ethereumjs-tx");

if (typeof process.argv[2] !== "string") {
  return console.error("Please specify the source CSV file.");
}

var file = process.argv[2];

var privateKey = Buffer.from(config.privateKey, "hex");

parseCsv = async () => {
  // try {
  var toTransfer = {};
  var contents = fs.readFileSync(file).toString();

  csv.parse(contents, function(err, columns) {
    if (err) {
      throw err;
    }

    console.log("Parsing...");

    let total = 0;
    let count = 0;

    columns.forEach(function(t) {
      if (t.length < 2) {
        throw "Must have at least two columns";
      }

      total += parseInt(t[1]);
      count++;

      if (typeof toTransfer[t[0]] !== "undefined") {
        toTransfer[t[0]].value = toTransfer[t[0]].value.add(t[1]);
      } else {
        toTransfer[t[0]] = {
          address: t[0],
          value: new BigNumber(t[1]),
          callback: 'http://localhost:8080/api/fake_callback',
          nonce: null
        };
      }
    });

    console.log("Number of Address: %d - Total amount: %d", count, total);

    toTransfer = Object.values(toTransfer);

    toTransfer.map(function(t) {
      t.abiValue =
        "0xa9059cbb" + // transfer
        t.address.substr(2).padStart(64, "0") +
        t.value
          .mul(new BigNumber(10).pow(config.tokenSymbols))
          .toString(16)
          .padStart(64, "0");
      return t;
    });
  });

  console.log("Done!");

  // Retrieve last nonce

  console.log("Retrieving latest nonce...");

  var address =
    "0x" +
    EthereumUtil.privateToAddress(
      config.privateKey.length === 64
        ? "0x" + config.privateKey
        : config.privateKey
    ).toString("hex");

  const web3 = new Web3(Web3.givenProvider || config.networkRpc);

  let nonce = await web3.eth.getTransactionCount(address);

  // nonce += 100;
  nonce = new BigNumber(nonce || 0);

  console.log("Next nonce for " + address + " is " + nonce);

  toTransfer.map(function(t) {
    t.nonce = nonce.toFixed();
    t.value = t.value.toFixed();
    nonce = nonce.add(1);

    const txParams = {
      nonce: toHex(t.nonce),
      gasPrice: toHex(new BigNumber(10).pow(9).mul(config.gasPrice)),
      gasLimit: toHex(config.gasLimit),
      to: config.tokenAddress,
      value: toHex(0),
      data: t.abiValue,
      // EIP 155 chainId - mainnet: 1, ropsten: 3
      chainId: config.networkId
    };

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);

    var signedData = "0x" + tx.serialize().toString("hex");

    t.signedData = signedData;

    return t;
  });

  var filename = "./distribution-" + new Date().toISOString() + ".json";

  fs.writeFile(filename, JSON.stringify(toTransfer), function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("Done. Distribution file created at " + filename);
  });

  // } catch (e) {
  // console.log("Could not read the given file: " + e.message);
  // }
};

parseCsv();

function toHex(input, padding) {
  return "0x" + new BigNumber(input).toString(16).padStart(padding || 0, "0");
}
