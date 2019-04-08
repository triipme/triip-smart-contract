var BigNumber = require("bignumber.js");
var EthereumTx = require("ethereumjs-tx");
var got = require("got");
var fs = require("fs");
const Web3 = require("Web3");

var config = require("./config.js");

if (typeof process.argv[2] !== "string") {
  return console.error("Could not open distribution file");
}

const makeTransfer = async () => {
  var contents = await fs.readFileSync(process.argv[2]);
  var toTransfer = JSON.parse(contents);

  if ((toTransfer.length || 0) === 0) {
    return console.error("File is either malformed or contains no transfers.");
  }

  var tokenDistribution = {
    network: config.network,
    distributions: toTransfer
  };

  const client = got.extend({
    baseUrl: config.apiUrl,
    headers: {
      Authorization: "Bearer " + config.token,
      "Content-Type": "application/json"
    }
  });

  client.post("/token_distribution", {
    body: JSON.stringify(tokenDistribution)
  });
};

makeTransfer();
