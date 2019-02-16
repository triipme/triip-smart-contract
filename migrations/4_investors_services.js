const TriipInvestorsServices = artifacts.require("TriipInvestorsServices");

module.exports = async (deployer, network, accounts) => {

  let buyer = accounts[1];
  let seller = accounts[2];
  let buyerWallet = accounts[3];

  // deployer.deploy(TriipInvestorsServices, buyer, seller, buyerWallet);
  
};
