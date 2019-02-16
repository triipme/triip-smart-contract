const TIIMToken = artifacts.require("TIIMToken");

const {
  MILLION,
  UNIT
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

    TIIM = await TIIMToken.deployed();
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

    const txn = await TIIM.processBuy({from: buyer, value: 10 * UNIT});

    const eventBuy = txn.logs[1];

    assert.equal(parseInt(eventBuy.args['_tiim_sold']) , 320 * UNIT , 'should receive 320 TIIM when purchase 10 TOMO');

    const crowdFundingWalletBalance = await web3.eth.getBalance(CROWD_FUNDING_WALLET);

    assert.equal(crowdFundingWalletBalance - 100 * UNIT, 10 * UNIT , 'Triip should receive 10 TOMO');

  });
});
