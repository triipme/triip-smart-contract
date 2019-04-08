var BigNumber = require("bignumber.js");
var EthereumTx = require("ethereumjs-tx");
var got = require("got");
var fs = require("fs");
const Web3 = require("Web3");

var config = require("./config.js");

const web3 = new Web3(
  Web3.givenProvider ||
    "https://rinkeby.infura.io/v3/710034254fa54f4cb22c151aeb0b398e"
);

String.prototype.padStart = function(amount, symbol) {
  var length = this.length;
  var symbols = length > amount ? 0 : amount - length;
  return symbol.repeat(symbols) + this;
};

if (typeof process.argv[2] !== "string") {
  return console.error("Could not open distribution file");
}

var contents = fs.readFileSync(process.argv[2]);
var toTransfer = JSON.parse(contents);

if ((toTransfer.length || 0) === 0) {
  return console.error("File is either malformed or contains no transfers.");
}

const makeTransfer = async t => {
  const txHash = web3.utils.sha3(t.signedData);

  web3.eth.sendSignedTransaction(t.signedData);

  console.log(t.address, txHash, "OK");

  if (toTransfer.length > 0) {
    makeTransfer(toTransfer.shift());
  }
};

makeTransfer(toTransfer.shift());
