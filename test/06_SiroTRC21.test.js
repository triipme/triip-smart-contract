// "0xF0187348678403ED9457B1B3dF316f2eD384463a","0x68235e990ec444E1247c0Bf236CdebEC75051Ffb","0x9eda1F9783adB23eC8d52525C7117Cd210DdAfDc","0x235AC69192a21952949358126177Fa4bb86e0184","0x7c240374515fbfd6a2448D7d720635028f7a822E","0xC320a067133695D9a10499d621314b8B116A5c5e","0x6550a3C13c02c9e7EFa0571813aE53714E8B866B"

const SIROToken = artifacts.require('SIROToken');

const {
  MILLION,
  UNIT,
  TRANSFER_GAS,
  TOTAL_SUPPLY,
  increaseTime,
  sendEth
} = require('../lib/utils');

let SIRO;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let TOMO_ALLOCATION_WALLET;
let FEE;

contract('SIROToken', accounts => {
  
  beforeEach('SIRO Token init', async () => {
    
    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    TOMO_ALLOCATION_WALLET = accounts[6];
    FEE = 3;

    SIRO = await SIROToken.new(
      COMMUNITY_WALLET, 
      CROWD_FUNDING_WALLET, 
      ECO_WALLET, 
      COMPANY_WALLET, 
      TEAM_WALLET, 
      FOUNDER_WALLET,
      TOMO_ALLOCATION_WALLET,
      FEE
      );

  });

  it('Total supply should be 500m', async () => {
    const totalSupply = await SIRO.totalSupply();

    assert.equal(totalSupply.valueOf(), TOTAL_SUPPLY, 'Total supply should be 500m');

  });

  it('Token sale wallet should be 165m', async () => {
    const balance = await SIRO.balanceOf(CROWD_FUNDING_WALLET);

    assert.equal(balance.valueOf(), 165 * MILLION * UNIT, 'Token sale wallet should have 165m');
  });

  it('Eco Wallet should be 75m', async () => {
    const balance = await SIRO.balanceOf(ECO_WALLET);

    assert.equal(balance.valueOf(), 75 * MILLION * UNIT, 'ECO Wallet should have 75m');
  });  

  it('Company Wallet should be 85m', async () => {
    const balance = await SIRO.balanceOf(COMPANY_WALLET);

    assert.equal(balance.valueOf(), 85 * MILLION * UNIT, 'Company Wallet should have 85m');
  });  
  
  it('Team vesting should be 40m = 8%', async () => {
    const balance = await SIRO.teamAllocation();

    assert.equal(balance.valueOf(), 40 * MILLION * UNIT, 'Team vesting should have 40m');
  });

  it('Founder vesting should be 10m = 2%', async () => {
    const balance = await SIRO.founderAllocation();

    assert.equal(balance.valueOf(), 10 * MILLION * UNIT, 'Team vesting should have 10m');
  });

  it('Team & Founder Wallet should have nothing when contract deploy', async () => {
    const teamBalance = await SIRO.balanceOf(TEAM_WALLET);

    assert.equal(teamBalance.valueOf(), 0, 'Team Wallet should have 0');

    const founderBalance = await SIRO.balanceOf(FOUNDER_WALLET);

    assert.equal(founderBalance.valueOf(), 0, 'Founder Wallet should have 0');
  });

  it('Community reserved wallet should have 125,000,000 token', async () => {
    const communityBalance = await SIRO.balanceOf(COMMUNITY_WALLET);

    assert.equal(communityBalance, 125 * MILLION * UNIT);
  });
});