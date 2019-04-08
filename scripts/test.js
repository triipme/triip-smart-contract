var BigNumber = require("bignumber.js");
var EthereumTx = require("ethereumjs-tx");
var got = require("got");
var fs = require("fs");
const Web3 = require("Web3");

var config = require("./config.js");

var privateKey = Buffer.from(config.privateKey, "hex");

const web3 = new Web3(  Web3.givenProvider ||    "https://rinkeby.infura.io/v3/710034254fa54f4cb22c151aeb0b398e");

var tx = {
  gasPrice: toHex(new BigNumber(10).pow(9).mul(config.gasPrice)),
  gasLimit: toHex(config.gasLimit),
  nonce: toHex("4000"),
  to : config.tokenAddress,
  data : '0xa9059cbb0000000000000000000000002d562aa8BE1df21f80b47FA097af66FC0ef006f500000000000000000000000000000000000000000000001ba5abf9e779380000'
}

web3.eth.accounts.signTransaction(tx, config.privateKey).then(signed => {
  web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', console.log)
});




// String.prototype.padStart = function(amount, symbol) {
//   var length = this.length;
//   var symbols = length > amount ? 0 : amount - length;
//   return symbol.repeat(symbols) + this;
// };

// if (typeof process.argv[2] !== "string") {
//   return console.error("Could not open distribution file");
// }

// var contents = fs.readFileSync(process.argv[2]);
// var toTransfer = JSON.parse(contents);

// if ((toTransfer.length || 0) === 0) {
//   return console.error("File is either malformed or contains no transfers.");
// }

// const makeTransfer = async (t) => {
//   const txParams = {
//     nonce: toHex(t.nonce),
//     gasPrice: toHex(new BigNumber(10).pow(9).mul(config.gasPrice)),
//     gasLimit: toHex(config.gasLimit),
//     to: config.tokenAddress,
//     value: toHex(0),
//     data: t.abiValue,
//     // EIP 155 chainId - mainnet: 1, ropsten: 3
//     chainId: config.networkId
//   };

//   const tx = new EthereumTx(txParams);
//   tx.sign(privateKey);

//   var signedData = '0x' + tx.serialize().toString("hex");

//   console.log(signedData);

//   web3.eth.sendSignedTransaction(signedData)
//   .on('receipt', console.log);

//   // console.log(t.address, txHash, "OK");

//   // got.get(config.etherscanApiUrl, {
//   //     query: {
//   //         module: 'proxy',
//   //         action: 'eth_sendRawTransaction',
//   //         hex: signedData,
//   //         apikey: config.etherscanToken
//   //     }
//   // }).on('error', function (e, b, r) {
//   //     console.error('failed', t, e, b);
//   // }).then(function (response) {
//   //     var data = JSON.parse(response.body);
//   //     if(data.error) {
//   //         console.error(t, data.error);
//   //     }else {
//   //         console.log(t.address, data.result, 'OK');
//   //     }
//   //     if(toTransfer.length > 0) {
//   //         makeTransfer(toTransfer.shift());
//   //     }
//   // })
// };

function toHex(input, padding) {
  return "0x" + new BigNumber(input).toString(16).padStart(padding || 0, "0");
}

// makeTransfer(toTransfer.shift());
