const TripFactory = artifacts.require("TripFactory");
const TIIMToken = artifacts.require("TIIMToken");
const TripVerifier = artifacts.require("TripVerifier");
const Trip = artifacts.require("Trip");
const { MILLION, UNIT, increaseTime, duration } = require("../lib/utils");

let OWNER;
let NON_OWNER;

let TIIM_TOKEN;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let ANONYMOUS;

let TRIP_VERIFIER;
let TRIP_FACTORY;
let TRIP;

contract("Trip Factory Testing", accounts => {
  beforeEach("Init", async () => {
    await initTripFactory(accounts);
  });

  it("Test create new trip", async () => {
    const tripCreatedTx = await TRIP_FACTORY.createTrip("Ha Noi", TRIP_VERIFIER.address, 1000000)
    const logs = tripCreatedTx.logs[0].args;

    assert.isNotNull(logs['trip'], "Trip created with address");
    assert(logs['tripSupplier'], OWNER, 'Supplier address is owner');
    assert(logs['title'], 'Ha Noi', 'Trip title should be `Ha Noi`');
    assert(logs['amount'].valueOf(), 1000000, 'Trip price should be `1000000`');
  });

  // it("Unstake less than 10 (minimum unstake setting) should receive exception", async () => {
    // try {
    //   await PATRON.unstake(9);

    //   assert(false, "Should not come here");
    // } catch (err) {
    //   assert.include(
    //     err.message,
    //     "Unstake must be greater than minimum unstake amount"
    //   );
    // }
  // });

});


contract("Trip Factory Testing", accounts => {
  beforeEach("Init", async () => {
    await initTripFactory(accounts);
    
    // create a new trip 
    const tripCreatedTx = await TRIP_FACTORY.createTrip("Ha Noi", TRIP_VERIFIER.address, 1000000)
    const logs = tripCreatedTx.logs[0].args;

    assert.isNotNull(logs['trip'], "Trip created with address");
    assert(logs['tripSupplier'], OWNER, 'Supplier address is owner');
    assert(logs['title'], 'Ha Noi', 'Trip title should be `Ha Noi`');
    assert(logs['amount'].valueOf(), 1000000, 'Trip price should be `1000000`');

    TRIP = await Trip.at(logs['trip']);
  });

  it("Verify Trip information", async () => {
    const tripTitle = await TRIP.title();
    const tripStatus = await TRIP.status();
    const tripVerifier = await TRIP.tripVerifier();
    const tripOwner = await TRIP.tripOwner();
    const avgRating = await TRIP.avgRating();
    const reviewCount = await TRIP.reviewCount();
    const amount = await TRIP.amount();

    assert(tripStatus, 0, 'Trip status should be NEW when init');
    assert(tripTitle, 'Ha Noi', 'Trip title should be `Ha Noi`');

    assert(tripVerifier, TRIP_VERIFIER.address, 'Trip Verifier address should be same');
    assert(tripOwner, OWNER, 'Trip owner should be same');

    assert(avgRating , 0 , 'Average rating should be 0 when init');
    assert(reviewCount, 0 , 'Review count should be 0 when init');
    assert(amount.valueOf(), 1000000, 'Trip price should be `1000000`');
  });

});





















var initTripFactory = async (accounts) => {
  OWNER = accounts[0];
    NON_OWNER = accounts[1];

    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    ANONYMOUS = accounts[9];

    TIIM_TOKEN = await TIIMToken.new(
      COMMUNITY_WALLET,
      CROWD_FUNDING_WALLET,
      ECO_WALLET,
      COMPANY_WALLET,
      TEAM_WALLET,
      FOUNDER_WALLET
    );

    TRIP_VERIFIER = await TripVerifier.new();
    
    TRIP_FACTORY = await TripFactory.new();

    await TRIP_FACTORY.setTIIMToken(TIIM_TOKEN.address);
}