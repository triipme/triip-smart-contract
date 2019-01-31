const TIIMToken = artifacts.require("TIIMToken");

module.exports = async (deployer, network, accounts) => {

  
  let communityWallet = accounts[0];
  let crowdFundingWallet = accounts[1];
  let ecoWallet = accounts[2];
  let companyWallet = accounts[3];

  deployer
    .then(() => {
      return TIIMToken.new(communityWallet, crowdFundingWallet, ecoWallet, companyWallet);
    })
  
};
