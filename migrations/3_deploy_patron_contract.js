const Patron = artifacts.require("Patron");
const PatronSetting = artifacts.require("PatronSetting");
const PatronStaking = artifacts.require("PatronStaking");

const SLEEP = 15000;
const frequenceInSeconds = 1800;
const frequenceRewardAmount = 1000;
const withdrawalDelayInSeconds = 604800; // 7 days
const minimumStakeAmount = 100;
const minimumUnstakeAmount = 10;

module.exports = async (deployer, network, accounts) => {

  deployer.deploy(PatronStaking);

  deployer.deploy(Patron);
  
  deployer.deploy(PatronSetting, frequenceInSeconds, frequenceRewardAmount, withdrawalDelayInSeconds, minimumStakeAmount, minimumUnstakeAmount);
  
};
