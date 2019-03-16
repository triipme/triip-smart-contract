const Patron = artifacts.require("Patron");
const PatronSetting = artifacts.require("PatronSetting");
const PatronStaking = artifacts.require("PatronStaking");

const SLEEP = 15000;

module.exports = async (deployer, network, accounts) => {

  deployer.deploy(PatronStaking);

  deployer.deploy(Patron);
  
  deployer.deploy(PatronSetting);
  
};
