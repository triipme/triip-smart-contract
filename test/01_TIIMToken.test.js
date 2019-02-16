const TIIMToken = artifacts.require("TIIMToken");

const {
  MILLION,
  UNIT,
  TRANSFER_GAS
} = require("../libs/constants");

const TOTAL_SUPPLY = 500 * MILLION * UNIT;
let TIIM;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;

contract("TIIMToken", accounts => {
  
  beforeEach("TIIM Token init", async () => {
    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];

    TIIM = await TIIMToken.new(COMMUNITY_WALLET, CROWD_FUNDING_WALLET, ECO_WALLET, COMPANY_WALLET);
  });

  it("Total supply should be 500,000,000", async () => {
    const totalSupply = await TIIM.totalSupply();

    assert.equal(totalSupply.valueOf(), TOTAL_SUPPLY);

  });

  it("Community reserved wallet should have 125,000,000 token", async () => {
    const communityBalance = await TIIM.balanceOf(COMMUNITY_WALLET);

    assert.equal(communityBalance, 125 * MILLION * UNIT);
  });

  it("Test buy TIIM with tomo -> 10 TOMO = 320 TIIM - Triip Wallet should receive 10 TOMO", async () => {
    
    const buyer = accounts[9];

    var remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 22 * MILLION * UNIT, "Public ICO should have 22m TIIM Token");

    const txn = await TIIM.processBuy({from: buyer, value: 10 * UNIT});

    const eventBuy = txn.logs[1];

    assert.equal(parseInt(eventBuy.args['_tiim_sold']) , 320 * UNIT , 'should receive 320 TIIM when purchase 10 TOMO');

    // balance in TOMO 
    var crowdFundingWalletBalance = await web3.eth.getBalance(CROWD_FUNDING_WALLET);

    assert.equal(crowdFundingWalletBalance - (100 * UNIT), 10 * UNIT , 'Triip should receive 10 TOMO');

    remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 21999680 * UNIT, "Public ICO should remain 21,999,680 TIIM Token");

    // teardown
    await web3.eth.sendTransaction({from: CROWD_FUNDING_WALLET, to: buyer, value: 10 * UNIT - TRANSFER_GAS})
  });

  it("Refill 1m TIIM Token scenario", async () => {

    var remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 22 * MILLION * UNIT, "Should have 22m when initialization");

    await TIIM.transfer(TIIM.address, 1 * MILLION * UNIT, {from : COMPANY_WALLET});

    remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 23 * MILLION * UNIT, "Should fill up 1m and remaining has total 23m");

  });
});
