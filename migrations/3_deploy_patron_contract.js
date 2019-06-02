const Patron = artifacts.require("Patron");
const PatronReward = artifacts.require("PatronReward");

const SLEEP = 15000;
const frequenceInSeconds = 1800;
const frequenceRewardAmount = 1000;
const withdrawalDelayInSeconds = 604800; // 7 days
const minimumStakeAmount = 100;
const minimumUnstakeAmount = 10;

module.exports = async (deployer, network, accounts) => {

  // deployer.deploy(PatronStaking);

  deployer.deploy(Patron, frequenceInSeconds, frequenceRewardAmount, withdrawalDelayInSeconds, minimumStakeAmount, minimumUnstakeAmount);
  
  deployer.deploy(Patron, frequenceInSeconds, frequenceRewardAmount, withdrawalDelayInSeconds, minimumStakeAmount, minimumUnstakeAmount);
  //"1800","1000000000000000000000","604800","100000000000000000000","10000000000000000000"
};
