const Patron = artifacts.require("Patron");
const PatronSetting = artifacts.require("PatronSetting");
const PatronStaking = artifacts.require("PatronStaking");
const TIIMToken = artifacts.require("TIIMToken");

const { MILLION, UNIT } = require("../lib/utils");

const FREQUENCE_IN_SECONDS = 3600;
const _WITHDRAWAL_DELAY_IN_SECONDS = 3600 * 48;
const FREQUENCE_REWARD_AMOUNT = 500;
const REWARD_EXPECTED_BALANCE = 25 * MILLION * UNIT;

let OWNER;
let NON_OWNER;
let PATRON;
let PATRON_SETTING;
let PATRON_STAKING;

let TIIM_TOKEN;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let ANONYMOUS;

const frequenceInSeconds = 1800;
const frequenceRewardAmount = 1000;
const withdrawalDelayInSeconds = 604800; // 7 days
const minimumStakeAmount = 100;
const minimumUnstakeAmount = 10;

contract("Patron Testing", accounts => {
  beforeEach("Init", async () => {
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

    PATRON = await Patron.new(
      frequenceInSeconds,
      frequenceRewardAmount,
      withdrawalDelayInSeconds,
      minimumStakeAmount,
      minimumUnstakeAmount
    );

    await PATRON.setTiimToken(TIIM_TOKEN.address);

  });

  it("Total staking amount should 0 when init", async () => {
    const stakingAmount = await PATRON.total_staking_amount();

    assert(stakingAmount, 0, "Total staking amount should be 0");
  });

  it("Unstake less than 10 (minimum unstake setting) should receive exception", async () => {
    try {
      await PATRON.unstake(9);

      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Unstake must be greater than minimum unstake amount"
      );
    }
  });

  it("Unstake when not stake should receive exception", async () => {
    try {
      await PATRON.unstake(15);

      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Staking balance should be greater or equals with unstake amount"
      );
    }
  });

  it('Call withdrawal without any pending withdrawal should receive exception', async() => {
    try{
      await PATRON.withdrawal(0);
      assert(false, 'Should not come here');
    }catch(err) {
      assert.include(err.message, 'Should have withdrawal pending');
    }
  });
  it('Staking', async() => {
    
      const tx = await TIIM_TOKEN.transferAndCall(PATRON.address, 100, "0x", {from: COMMUNITY_WALLET});

      // console.log(tx.logs);

      var waitingBalance = await PATRON.waiting_list(0);

      // console.log(waitingBalance);

      // await TIIM_TOKEN.transferAndCall(PATRON.address, 200, "0x", {from: COMMUNITY_WALLET});

      // waitingBalance = await PATRON.waiting_list(1);

      // console.log(waitingBalance);

      const lastTrigger = new Date() . getTime () / 1000 - 1900;

      await PATRON.setLastTriggerPatronRewardAt(lastTrigger);
      
      const tx1 = await PATRON.triggerPatronReward();

      console.log(tx1.logs);

      // const epoch = await PATRON.epoch();

      // console.log(epoch);
    
  });
  
});
