const TIIMToken = artifacts.require("TIIMToken");

module.exports = async (deployer, network, accounts) => {

  
  let communityWallet = accounts[0];
  let crowdFundingWallet = accounts[1];
  let ecoWallet = accounts[2];
  let companyWallet = accounts[3];
  let teamWallet = accounts[4];
  let founderWallet = accounts[5];

  if(network == 'develop') {
    
    deployer.deploy(TIIMToken, communityWallet, crowdFundingWallet, ecoWallet, companyWallet, teamWallet, founderWallet);
  
  } else {
    deployer
    .then(() => {
      return TIIMToken.new(communityWallet, crowdFundingWallet, ecoWallet, companyWallet, teamWallet, founderWallet);
    })
  }
  
  
};
