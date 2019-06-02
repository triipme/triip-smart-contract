const TripFactory = artifacts.require("TripFactory");

const TripVerifier = artifacts.require("TripVerifier");

module.exports = async (deployer, network, accounts) => {

  deployer.deploy(TripFactory);
  deployer.deploy(TripVerifier);
  
};
