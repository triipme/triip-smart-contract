const SIROToken = artifacts.require("SIROToken");

module.exports = async (deployer, network, accounts) => {

  
  let communityWallet = accounts[0];
  let crowdFundingWallet = accounts[1];
  let ecoWallet = accounts[2];
  let companyWallet = accounts[3];
  let teamWallet = accounts[4];
  let founderWallet = accounts[5];

  let tomoAllocationWallet = accounts[6];

  let fee = 3;

  if(network == 'develop') {
    
    deployer.deploy(SIROToken, 
      communityWallet, 
      crowdFundingWallet, 
      ecoWallet, 
      companyWallet, 
      teamWallet, 
      founderWallet, 
      tomoAllocationWallet,
      fee);
  
  } else {
    deployer
    .then(() => {
      return SIROToken.new(
        communityWallet, 
        crowdFundingWallet, 
        ecoWallet, 
        companyWallet, 
        teamWallet, 
        founderWallet, 
        tomoAllocationWallet,
        fee);
    })
  }
  
  
};
