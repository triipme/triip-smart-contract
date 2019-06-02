const Patron = artifacts.require("Patron");
const PatronReward = artifacts.require("PatronReward");
const TIIMToken = artifacts.require("TIIMToken");

const { MILLION, UNIT, increaseTime, duration } = require("../lib/utils");

const FREQUENCE_IN_SECONDS = 3600;
const _WITHDRAWAL_DELAY_IN_SECONDS = 3600 * 48;
const FREQUENCE_REWARD_AMOUNT = 500;
const REWARD_EXPECTED_BALANCE = 25 * MILLION * UNIT;

let OWNER;
let NON_OWNER;
let PATRON;
let PATRON_REWARD;
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
const frequenceRewardAmount = 1000 * UNIT;
const withdrawalDelayInSeconds = 604800; // 7 days
const minimumStakeAmount = 100 * UNIT;
const minimumUnstakeAmount = 10 * UNIT;

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

    PATRON_REWARD = await PatronReward.new();

    PATRON = await Patron.new(
      frequenceInSeconds,
      frequenceRewardAmount,
      withdrawalDelayInSeconds,
      minimumStakeAmount,
      minimumUnstakeAmount
    );

    await PATRON.setTiimToken(TIIM_TOKEN.address);
    await PATRON.setPatronReward(PATRON_REWARD.address);


    await PATRON_REWARD.setTiimToken(TIIM_TOKEN.address);
    await PATRON_REWARD.setPatron(PATRON.address);

    // send token to reward pool
    await TIIM_TOKEN.transfer(PATRON_REWARD.address, 1000000 * UNIT);
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
      await PATRON.unstake(15 * UNIT);
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Staking balance should be greater or equals with unstake amount"
      );
    }
  });

  it("Unstake under minimum unstake setting should receive exception", async () => {
    try {
      await PATRON.unstake(15);
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Unstake must be greater than minimum unstake amount"
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

  it('Stake less than minimum required should receive exception', async() => {
    const stakingAmount = 99 * UNIT;
    try {
      await TIIM_TOKEN.transferAndCall(PATRON.address, stakingAmount, "0x", {from: COMMUNITY_WALLET});
      assert(false, "Should not come here");
    } catch(err) {
      assert.include(err.message, "Must equals or greater than minimum staking amount");
    }
  });  

  it('Staking over minimum staking should be success', async() => {
    
      const stakingAmount = 100 * UNIT;
      const tx = await TIIM_TOKEN.transferAndCall(PATRON.address, stakingAmount, "0x", {from: COMMUNITY_WALLET});

      const logs = tx.logs[1].args;

      assert(logs.sender, OWNER);
      assert(logs._to, PATRON.address);
      assert(logs._purchase_amount, stakingAmount);      
    
  });

  it('Test dispatch reward' , async() => {
    // stake 1000
    await TIIM_TOKEN.transferAndCall(PATRON.address, 1000 * UNIT, "0x", {from: COMMUNITY_WALLET});

    // stake 9000
    await TIIM_TOKEN.transferAndCall(PATRON.address, 9000 * UNIT, "0x", {from: CROWD_FUNDING_WALLET});

    var waiting1 = await PATRON.waiting_list(0);

    assert(waiting1[0], COMMUNITY_WALLET, "Staker should be from COMMUNITY_WALLET");
    assert(waiting1[1], 1000 * UNIT, "Staking amount from COMMUNITY_WALLET should be 1000 Token");

    var waiting2 = await PATRON.waiting_list(1);
    assert(waiting2[0], CROWD_FUNDING_WALLET, "Staker should be from CROWD_FUNDING_WALLET");
    assert(waiting2[1], 9000 * UNIT, "Staking amount from CROWD_FUNDING_WALLET should be 1000 Token");

    var totalStaking = await PATRON.total_staking_amount();
    assert(totalStaking, 0, "Total staking should be zero 0");

    var rewardBalance = await TIIM_TOKEN.balanceOf(PATRON_REWARD.address);
    assert(rewardBalance, 1000000 * UNIT, "Reward pool should be 1m");

    await increaseTime(duration.minutes(30));
    
    const tx = await PATRON.triggerPatronReward();
    console.log(tx);

  })

      // var waitingBalance = await PATRON.waiting_list(0);

      // console.log(waitingBalance);

      // await TIIM_TOKEN.transferAndCall(PATRON.address, 200, "0x", {from: COMMUNITY_WALLET});

      // waitingBalance = await PATRON.waiting_list(1);

      // console.log(waitingBalance);

      // const lastTrigger = new Date() . getTime () / 1000 - 1900;

      // await PATRON.setLastTriggerPatronRewardAt(lastTrigger);
      
      // const tx1 = await PATRON.triggerPatronReward();

      // console.log(tx1.logs[3].args._amount);

      // const epoch = await PATRON.epoch();

      // console.log(epoch);

  
});
