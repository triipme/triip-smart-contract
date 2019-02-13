const TIIMToken = artifacts.require("TIIMToken");

const SLEEP = 15000;

module.exports = async (deployer, network, accounts) => {

  let communityWallet = accounts[0];
  let crowdFundingWallet = accounts[1];
  let ecoWallet = accounts[2];
  let companyWallet = accounts[3];

  deployer.deploy(TIIMToken, communityWallet, crowdFundingWallet, ecoWallet, companyWallet);
  
};
