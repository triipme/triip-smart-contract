
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env.MNEMONIC;

module.exports = {
  // Uncommenting the defaults below 
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },


  networks: {
    develop: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    tomo: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://rpc.tomochain.com");
      },
      network_id: 88,
      gas: 4200000,
      gasPrice: 10000000000
    },
  }
  
};
