const Patron = artifacts.require("Patron");
const PatronSetting = artifacts.require("PatronSetting");

const SLEEP = 15000;

module.exports = async (deployer, network, accounts) => {

  deployer.deploy(Patron);
  
  deployer.deploy(PatronSetting);
  
};
