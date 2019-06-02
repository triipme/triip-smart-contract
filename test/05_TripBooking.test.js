const TripFactory = artifacts.require("TripFactory");
const TIIMToken = artifacts.require("TIIMToken");
const TripVerifier = artifacts.require("TripVerifier");
const Trip = artifacts.require("Trip");
const Booking = artifacts.require("Booking");
const { MILLION, UNIT, increaseTime, duration } = require("../lib/utils");

let OWNER;
let TRIP_VERIFIER_PERSON;

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

contract("Trip Factory & Trip Verifier Testing", accounts => {
  beforeEach("Init", async () => {
    await initTripFactory(accounts);
  });

  it("Test create new trip", async () => {
    const tripCreatedTx = await TRIP_FACTORY.createTrip(
      "Ha Noi",
      TRIP_VERIFIER.address,
      1 * MILLION * UNIT
    );
    const logs = tripCreatedTx.logs[0].args;

    assert.isNotNull(logs["trip"], "Trip created with address");
    assert.equal(logs["tripSupplier"], OWNER, "Supplier address is owner");
    assert.equal(logs["title"], "Ha Noi", "Trip title should be `Ha Noi`");
    assert.equal(
      logs["amount"].valueOf(),
      1 * MILLION * UNIT,
      "Trip price should be `1 * MILLION * UNIT`"
    );
  });

  it("Onwer should be able to add verifier", async () => {
    const tx = await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const logs = tx.logs[0];
    const verifier = logs.args["verifier"];

    assert.equal(
      logs.event,
      "AddedVerifier",
      "Should be emit event AddedVerifier"
    );
    assert.equal(
      verifier,
      TRIP_VERIFIER_PERSON,
      "Should be same Trip verifier person"
    );

    const isVerified = await TRIP_VERIFIER.isVerifier(verifier);
    assert.isTrue(isVerified, "Should be verified");
  });

  it("Owner should be able to remove verifier", async () => {
    // given : add verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    var isVerified = await TRIP_VERIFIER.isVerifier(TRIP_VERIFIER_PERSON);
    assert.isTrue(isVerified, "Should be verified");

    // when : owner remove verifier
    await TRIP_VERIFIER.removeVerifier(TRIP_VERIFIER_PERSON);
    // then
    isVerified = await TRIP_VERIFIER.isVerifier(TRIP_VERIFIER_PERSON);
    assert.isFalse(isVerified, "Should not be verified");
  });

  it("Non-owner should not allow to add Trip Verifier", async () => {
    try {
      await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON, {
        from: ANONYMOUS
      });
      assert.equal(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "revert");
    }
  });

  it("Non-owner should not allow to remove Trip Verifier", async () => {
    // given : add verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    var isVerified = await TRIP_VERIFIER.isVerifier(TRIP_VERIFIER_PERSON);
    assert.isTrue(isVerified, "Should be verified");

    try {
      await TRIP_VERIFIER.removeVerifier(TRIP_VERIFIER_PERSON, {
        from: ANONYMOUS
      });
      assert.equal(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "revert");
    }
  });
});

contract("Trip Factory Testing", accounts => {
  beforeEach("Init", async () => {
    await initTripFactory(accounts);

    // create a new trip
    const tripCreatedTx = await TRIP_FACTORY.createTrip(
      "Ha Noi",
      TRIP_VERIFIER.address,
      1 * MILLION * UNIT
    );
    const logs = tripCreatedTx.logs[0].args;

    assert.isNotNull(logs["trip"], "Trip created with address");
    assert.equal(logs["tripSupplier"], OWNER, "Supplier address is owner");
    assert.equal(logs["title"], "Ha Noi", "Trip title should be `Ha Noi`");
    assert.equal(
      logs["amount"].valueOf(),
      1 * MILLION * UNIT,
      "Trip price should be `1 * MILLION * UNIT`"
    );

    TRIP = await Trip.at(logs["trip"]);
  });

  it("Verify Trip information", async () => {
    const tripTitle = await TRIP.title();
    const tripStatus = await TRIP.status();
    const tripVerifier = await TRIP.tripVerifier();
    const tripOwner = await TRIP.tripOwner();
    const avgRating = await TRIP.avgRating();
    const reviewCount = await TRIP.reviewCount();
    const amount = await TRIP.amount();
    const tiimToken = await TRIP.token();

    assert.equal(tripStatus, 0, "Trip status should be NEW when init");
    assert.equal(tripTitle, "Ha Noi", "Trip title should be `Ha Noi`");

    assert.equal(
      tripVerifier,
      TRIP_VERIFIER.address,
      "Trip Verifier address should be same"
    );
    assert.equal(tripOwner, OWNER, "Trip owner should be same");

    assert.equal(avgRating, 0, "Average rating should be 0 when init");
    assert.equal(reviewCount, 0, "Review count should be 0 when init");
    assert.equal(amount.valueOf(), 1 * MILLION * UNIT, "Trip price should be `1 * MILLION * UNIT`");
    assert.equal(tiimToken, TIIM_TOKEN.address, "TIIM Token should be same");
  });

  it("Book trip before status PUBLIC should receive exception", async () => {
    try {
      await TRIP.book();
      assert.equal(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "This Trip have not public yet");
    }
  });

  it("Trip status NEW should allow Trip Verifier (internal) to book", async () => {
    // given : setup trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);

    // when : verifier book
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const log = tx.logs[0];
    const bookingAddress = log.args["booking"];

    // then
    assert.equal(
      log.event,
      "BookingCreation",
      "Should emit `BookingCreation` event"
    );
    assert.isNotNull(
      bookingAddress,
      "Should created and booking address available"
    );
    assert.equal(
      log.args["traveller"],
      TRIP_VERIFIER_PERSON,
      "Should be Trip Verifier Person"
    );

    // is valid booking address
    const isValidBooking = await TRIP.isValidBookingAddress(bookingAddress);
    assert.isTrue(isValidBooking, "Should be valid booking contract address");

    const booking = await Booking.at(bookingAddress);
    const bookingStatus = await booking.status();
    assert.equal(bookingStatus, 0, "Should be new when creating");
  });

  it("Approve from anonymous should get exception", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];
    const booking = await Booking.at(bookingAddress);

    try {
      await booking.approve({ from: ANONYMOUS });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Only trip owner can invoke this function");
    }
  });

  it("Try to pay when booking has not APPROVED yet should get exception", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];
    const booking = await Booking.at(bookingAddress);

    try {
      await TIIM_TOKEN.transferAndCall(booking.address, 10000, "0x", {
        from: COMMUNITY_WALLET
      });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Status must be Approved");
    }
  });

  it("Pay amount should equals booking amount", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];

    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying

    try {
      await TIIM_TOKEN.transferAndCall(booking.address, 10000, "0x", {
        from: COMMUNITY_WALLET
      });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Require pay amount equals booking amount");
    }
  });

  it("Finish trip before PAID should get exception", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];

    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying

    try {
      await booking.finish(5, { from: TRIP_VERIFIER_PERSON });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Status must be Paid");
    }
  });

  it("Finish without rating shoud get exception", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];

    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying
    await TIIM_TOKEN.transferAndCall(booking.address, 1 * MILLION * UNIT, "0x", {
      from: COMMUNITY_WALLET
    });
    // when : finish and rating
    try {
      await booking.finish(0, { from: TRIP_VERIFIER_PERSON });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Must give rating");
    }
  });

  it("Trip should not be PUBLIC when Trip Verifier rate below 4", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];

    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying
    await TIIM_TOKEN.transferAndCall(booking.address, 1 * MILLION * UNIT, "0x", {
      from: COMMUNITY_WALLET
    });
    // when : finish and rating
    await booking.finish(3, { from: TRIP_VERIFIER_PERSON });
    // then
    const tripStatus = await TRIP.status();
    assert.equal(tripStatus.valueOf(), 0, "Should still be NEW");
  });

  it("Trip should be PUBLIC when Trip Verifier rate equals or greater than 4", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);

    for (var i = 0; i < 2; i++) {
      const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
      const bookingAddress = tx.logs[0].args["booking"];

      // given : go through life cycle of Trip then rating
      const booking = await Booking.at(bookingAddress);
      await booking.approve();
      // paying
      await TIIM_TOKEN.transferAndCall(booking.address, 1 * MILLION * UNIT, "0x", {
        from: COMMUNITY_WALLET
      });
      // when : finish and rating
      await booking.finish(5, { from: TRIP_VERIFIER_PERSON });
    }
    // then : Trip should be PUBLIC
    const tripStatus = await TRIP.status();
    assert.equal(tripStatus.valueOf(), 1, "Should still be PUBLIC");
  });

  it("Withdrawal before FINISHED should get exception", async () => {
    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];

    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying
    await TIIM_TOKEN.transferAndCall(booking.address, 1 * MILLION * UNIT, "0x", {
      from: COMMUNITY_WALLET
    });
    try {
      await booking.withdrawal();
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Status must be Finished");
    }
  });

  it("Withdrawal token back to Trip Supplier Wallet", async () => {
    var tripSupplierBalance = await TIIM_TOKEN.balanceOf(OWNER);
    assert.equal(tripSupplierBalance.valueOf(), 125 * MILLION * UNIT, 'Should equals 125m');

    // given : booking successful by trip verifier
    await TRIP_VERIFIER.addVerifier(TRIP_VERIFIER_PERSON);
    const tx = await TRIP.book({ from: TRIP_VERIFIER_PERSON });
    const bookingAddress = tx.logs[0].args["booking"];
  
    // given : go through life cycle of Trip then rating
    const booking = await Booking.at(bookingAddress);
    await booking.approve();
    // paying
    await TIIM_TOKEN.transferAndCall(booking.address, 1 * MILLION * UNIT, "0x", {
      from: CROWD_FUNDING_WALLET
    });


    await booking.finish(5, { from: TRIP_VERIFIER_PERSON });
    await booking.withdrawal();

    // then : trip supplier wallet should receive Token
    tripSupplierBalance = await TIIM_TOKEN.balanceOf(OWNER);
    assert.equal(tripSupplierBalance.valueOf(), 126 * MILLION * UNIT, 'Should receive Token from Booking');
  });
});

var initTripFactory = async accounts => {
  OWNER = accounts[0];
  TRIP_VERIFIER_PERSON = accounts[1];

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
};
