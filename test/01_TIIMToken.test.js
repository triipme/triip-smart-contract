// Community Wallet
// Crowd Funding Wallet
// Eco Wallet
// Company Wallet
// Team Wallet
// Founder Wallet

// "0xF0187348678403ED9457B1B3dF316f2eD384463a","0x68235e990ec444E1247c0Bf236CdebEC75051Ffb","0x9eda1F9783adB23eC8d52525C7117Cd210DdAfDc","0x235AC69192a21952949358126177Fa4bb86e0184","0x7c240374515fbfd6a2448D7d720635028f7a822E","0xC320a067133695D9a10499d621314b8B116A5c5e","0x6550a3C13c02c9e7EFa0571813aE53714E8B866B"

const TIIMToken = artifacts.require('TIIMToken');

const {
  MILLION,
  UNIT,
  TRANSFER_GAS,
  TOTAL_SUPPLY,
  increaseTime
} = require('../lib/utils');

let TIIM;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let TOMO_ALLOCATION_WALLET;
let BENEFICIARY_WALLET;

contract('TIIMToken', accounts => {
  
  beforeEach('TIIM Token init', async () => {
    
    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    TOMO_ALLOCATION_WALLET = accounts[6];
    BENEFICIARY_WALLET = accounts[7];

    TIIM = await TIIMToken.new(COMMUNITY_WALLET, CROWD_FUNDING_WALLET, ECO_WALLET, COMPANY_WALLET, TEAM_WALLET, FOUNDER_WALLET, TOMO_ALLOCATION_WALLET, BENEFICIARY_WALLET);

    // mock: time travel to 10 days later - pass start public ICO time
    await increaseTime(864000);

    // kick start public ICO for transfer token
    await TIIM.unpause();
  });

  it('Total supply should be 500m', async () => {
    const totalSupply = await TIIM.totalSupply();

    assert.equal(totalSupply.valueOf(), TOTAL_SUPPLY, 'Total supply should be 500m');

  });

  it('Crowd Funding Wallet should be 75m', async () => {
    const balance = await TIIM.balanceOf(CROWD_FUNDING_WALLET);

    assert.equal(balance.valueOf(), 75 * MILLION * UNIT, 'Crowd Funding Wallet should have 75m');
  });

  it('Eco Wallet should be 75m', async () => {
    const balance = await TIIM.balanceOf(ECO_WALLET);

    assert.equal(balance.valueOf(), 75 * MILLION * UNIT, 'ECO Wallet should have 75m');
  });  

  it('Company Wallet should be 85m', async () => {
    const balance = await TIIM.balanceOf(COMPANY_WALLET);

    assert.equal(balance.valueOf(), 85 * MILLION * UNIT, 'Company Wallet should have 85m');
  });  
  
  it('TOMO Allocation Wallet should be 90m', async () => {
    const balance = await TIIM.balanceOf(TOMO_ALLOCATION_WALLET);

    assert.equal(balance.valueOf(), 90 * MILLION * UNIT, 'Tomo Allocation Wallet should have 90m');
  });    

  it('Team vesting should be 40m = 8%', async () => {
    const balance = await TIIM.teamAllocation();

    assert.equal(balance.valueOf(), 40 * MILLION * UNIT, 'Team vesting should have 40m');
  });

  it('Founder vesting should be 10m = 2%', async () => {
    const balance = await TIIM.founderAllocation();

    assert.equal(balance.valueOf(), 10 * MILLION * UNIT, 'Team vesting should have 10m');
  });

  it('Team & Founder Wallet should have nothing when contract deploy', async () => {
    const teamBalance = await TIIM.balanceOf(TEAM_WALLET);

    assert.equal(teamBalance.valueOf(), 0, 'Team Wallet should have 0');

    const founderBalance = await TIIM.balanceOf(FOUNDER_WALLET);

    assert.equal(founderBalance.valueOf(), 0, 'Founder Wallet should have 0');
  });

  it('Tomo conversion rate should be 1 TOMO = 40 TIIM Token', async() => {
    const conversionRate = await TIIM.conversionRate();

    assert.equal(conversionRate, 40 , '1 TOMO should convert 40 TIIM Token');
  });

  it('Minimum contribute should be 10 TOMO', async () => {
    const minimumContribute = await TIIM.minimumContribute();

    assert.equal(minimumContribute, 10, 'Minimum TOMO contribute should be 10');
  });

  it('Community reserved wallet should have 125,000,000 token', async () => {
    const communityBalance = await TIIM.balanceOf(COMMUNITY_WALLET);

    assert.equal(communityBalance, 125 * MILLION * UNIT);
  });

  it('Purchase TIIM with tomo -> 10 TOMO = 400 TIIM - Triip Wallet should receive 10 TOMO', async () => {

    const buyer = accounts[9];

    var remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 90 * MILLION * UNIT, 'Public ICO should have 90m TIIM Token');

    const txn = await TIIM.processBuy({from: buyer, value: 10 * UNIT});

    const eventBuy = txn.logs[1];

    assert.equal(parseInt(eventBuy.args['_tiim_sold']) , 400 * UNIT , 'should receive 320 TIIM when purchase 10 TOMO');

    // balance beneficiary
    var balance = await web3.eth.getBalance(BENEFICIARY_WALLET);

    console.log("beneficiary's balance : ", parseInt(balance) / UNIT ) ;

    assert.equal(balance, 10 * UNIT , "Triip's beneficiary should receive 10 TOMO");

    remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 89999600 * UNIT, 'Public ICO should remain 89,999,600 TIIM Token');

    // teardown
    await web3.eth.sendTransaction({from: BENEFICIARY_WALLET, to: buyer, value: 10 * UNIT - TRANSFER_GAS})
  });

  it('Refill 1m TIIM Token', async () => {

    var remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 90 * MILLION * UNIT, 'Should have 90m when initialization');

    await TIIM.transfer(TOMO_ALLOCATION_WALLET, 1 * MILLION * UNIT, {from : COMPANY_WALLET});

    remaining = await TIIM.publicIcoRemainingToken();

    assert.equal(remaining.valueOf(), 91 * MILLION * UNIT, 'Should fill up 1m and remaining has total 91m');

  });

  it('Refund remaining token to Patron', async () => {

    // mock: time travel to 60 days later - pass end public ICO time
    await increaseTime(5184000);

    const txn = await TIIM.refundRemainingTokenToPatron();

    const transferEvent = txn.logs[0];

    const refundEvent = txn.logs[1];

    assert.equal(transferEvent.args['value'].valueOf(), 90 * MILLION * UNIT, 'Should receive 90m token');

    assert.equal(transferEvent.args['to'], COMMUNITY_WALLET, 'Receiver should be crowd funding wallet');

    assert.equal(refundEvent.args['_patron_wallet'], COMMUNITY_WALLET, 'Receiver should be crowd funding wallet');
    assert.equal(refundEvent.args['_tiim_remaining_token'], 90 * MILLION * UNIT, 'Should receive 90m token');
  });

});