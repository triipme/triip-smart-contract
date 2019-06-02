const Patron = artifacts.require('Patron');
const TIIMToken = artifacts.require('TIIMToken');

const {
  MILLION,
  UNIT
} = require('../lib/utils');

const FREQUENCE_IN_SECONDS = 3600;
const _WITHDRAWAL_DELAY_IN_SECONDS = 3600 * 48;
const FREQUENCE_REWARD_AMOUNT = 500;
const REWARD_EXPECTED_BALANCE = 25 * MILLION * UNIT;

let OWNER;
let NON_OWNER;
let PATRON;
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

contract('Patron Setting Testing', accounts => {
  beforeEach('Init', async () => {
    
    OWNER = accounts[0];
    NON_OWNER = accounts[1];

    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    ANONYMOUS = accounts[9];

    TIIM_TOKEN = await TIIMToken.new(COMMUNITY_WALLET, CROWD_FUNDING_WALLET, ECO_WALLET, COMPANY_WALLET, TEAM_WALLET, FOUNDER_WALLET);

    PATRON = await Patron.new(frequenceInSeconds, frequenceRewardAmount, withdrawalDelayInSeconds, minimumStakeAmount, minimumUnstakeAmount);

  });

  it('Set TIIM Token is not a contract should throw exception', async () => {
    
    try {
      await PATRON.setTiimToken(NON_OWNER);

      assert(false, 'Should not come here');

    } catch (err) {
      assert.include(err.message, 'TIIM Token must be a contract');
    }
  });

  it('Owner staking patron', async () => {
    const patronOwner = await PATRON.owner();

    const PatronSettingOwner = await PATRON.owner();

    assert.equal(patronOwner, OWNER, 'Owner should be ' + OWNER);

    assert.equal(PatronSettingOwner, OWNER, 'Owner should be ' + OWNER);
  });

  it('Only owner should be able to set Frequence in seconds', async () => {
    const txn = await PATRON.setFrequenceInSeconds(FREQUENCE_IN_SECONDS);

    // expect fired event should contains these information
    const frequenceInSeconds = txn.logs[0].args.frequence_in_seconds.valueOf();

    assert.equal(frequenceInSeconds, 3600);

    const eventName = txn.logs[0].event;

    assert.equal(eventName, 'ModifiedFrequenceInSeconds');

    // ensure instance variable updated
    const freInSeconds = await PATRON.frequence_in_seconds();

    assert.equal(
      freInSeconds,
      FREQUENCE_IN_SECONDS,
      'Frequence in seconds should be 3,600 seconds'
    );
  });

  it('Non owner should not be able to set Frequence in seconds', async () => {
    try {
      await PATRON.setFrequenceInSeconds(FREQUENCE_IN_SECONDS, {
        from: NON_OWNER
      });

      assert(false, 'Should not come here');
    } catch (err) {
      assert.include(err.message, 'revert');
    }
  });

  it('Only owner should be able to set  withdrawal delay in seconds', async () => {
    await PATRON.setWithdrawalDelayInSeconds(
      _WITHDRAWAL_DELAY_IN_SECONDS
    );

    const WithdrawalDelayInSeconds = await PATRON.withdrawal_delay_in_seconds();

    assert.equal(
      WithdrawalDelayInSeconds,
      _WITHDRAWAL_DELAY_IN_SECONDS,
      ' withdrawal delay in seconds should be 172,800 seconds '
    );
  });

  it('Only owner should be able to set frequence reward amount', async () => {
    await PATRON.setFrequenceRewardAmount(FREQUENCE_REWARD_AMOUNT);
    const frequenceRewardAmount = await PATRON.frequence_reward_amount();

    assert.equal(
      frequenceRewardAmount,
      FREQUENCE_REWARD_AMOUNT,
      'Frequence reward amount should be 500 TIIM Token'
    );
  });

  it('Non owner should not be able to set frequence reward amount', async () => {
    try {
      await PATRON.setFrequenceRewardAmount(FREQUENCE_REWARD_AMOUNT, {
        from: NON_OWNER
      });

      assert(false, 'Should not come here');
    } catch (err) {
      assert.include(err.message, 'revert');
    }
  });

  it('Non owner should not be able to set minimum staking amount', async () => {
    try {
      await PATRON.setMinimumStakeAmount(50, { from: NON_OWNER });

      assert(false, 'Should not come here');
    } catch (err) {
      assert.include(err.message, 'revert');
    }
  });

  it('patron epoch should be 30 minutes', async() => {
    const frequenceInMinutes = 30;

    const frequenceInSeconds = await PATRON.frequence_in_seconds();
    
    assert(frequenceInSeconds / 60 , 30 , 'Patron epoch should be 30 minutes when init');
  })

  it('patron reward default should be 1000 TIIM per epoch', async () => {
    const reward = await PATRON.frequence_reward_amount();

    assert(reward, 1000, 'Patron Reward should be 1000 when init');
  })

  it('Withdrawal delay should be 7 days', async() => {
    const delayInDays = 7 ;
    
    const withdrawalDelayInSeconds = await PATRON.withdrawal_delay_in_seconds();

    assert(withdrawalDelayInSeconds / 60 / 60 / 24, delayInDays, 'Withdrawal delay should be 7 days when init');
  })

  it('Minimum stake amount should be 100', async () => {
    const minimumStakeAmount = await PATRON.minimum_stake_amount();

    assert(minimumStakeAmount, 100, 'Minimum stake amount should be 100 when init');
  })

  it('Minimum unstake amount should be 10', async() => {
    const minimumUnstakeAmount = await PATRON.minimum_unstake_amount();

    assert(minimumUnstakeAmount, 10, 'Minimum unstake amount should be 10 when init');
  })
});
