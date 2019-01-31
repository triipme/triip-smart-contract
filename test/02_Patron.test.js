const Patron = artifacts.require('Patron');
const RewardPatron = artifacts.require('RewardPatron');

const FREQUENCE_IN_SECONDS = 3600;
const _WITHDRAWAL_DELAY_IN_SECONDS = 3600 * 48;
const FREQUENCE_REWARD_AMOUNT = 500;

let OWNER;
let NON_OWNER;
let PATRON;
let REWARD_PATRON;

contract('Patron', accounts => {
  beforeEach('Init', async () => {
    OWNER = accounts[0];

    PATRON = await Patron.deployed();

    REWARD_PATRON = await RewardPatron.deployed();

    await REWARD_PATRON.setPatron(PATRON.address);
  });

  it('Owner staking patron', async () => {
    const patronOwner = await PATRON.owner();

    const RewardPatronOwner = await REWARD_PATRON.owner();

    assert.equal(patronOwner, OWNER, 'Owner should be ' + OWNER);

    assert.equal(RewardPatronOwner, OWNER, 'Owner should be ' + OWNER);
  });

  it('Non owner should not be able to set Patron for Stacking Patron contact', async () => {
    try {
      await REWARD_PATRON.setPatron(PATRON.address, { from: NON_OWNER });

      assert(false, 'Should not come here');
    } catch (err) {
      assert.include(err.message, 'invalid address');
    }
  });

  it('Only owner should be able to set Frequence in seconds', async () => {
    await REWARD_PATRON.setFrequenceInSeconds(FREQUENCE_IN_SECONDS);

    const freInSeconds = await REWARD_PATRON.frequence_in_seconds();

    assert.equal(
      freInSeconds,
      FREQUENCE_IN_SECONDS,
      'Frequence in seconds should be 3,600 seconds'
    );
  });

  it('Non owner should not be able to set Frequence in seconds', async () => {
    try {
      await REWARD_PATRON.setFrequenceInSeconds(FREQUENCE_IN_SECONDS, {
        from: NON_OWNER
      });
      
      assert(false, 'Should not come here');
    
    } catch (err) {
      assert.include(err.message, 'invalid address');
    }
  });

  it('Only owner should be able to set  withdrawal delay in seconds', async () => {
    await REWARD_PATRON.setWithdrawalDelayInSeconds(
      _WITHDRAWAL_DELAY_IN_SECONDS
    );

    const WithdrawalDelayInSeconds = await REWARD_PATRON.withdraw_delay_in_seconds();

    assert.equal(
      WithdrawalDelayInSeconds,
      _WITHDRAWAL_DELAY_IN_SECONDS,
      ' withdrawal delay in seconds should be 172,800 seconds '
    );
  });

  it('Only owner should be able to set frequence reward amount', async () => {
    await REWARD_PATRON.setFrequenceRewardAmount(FREQUENCE_REWARD_AMOUNT);
    const frequenceRewardAmount = await REWARD_PATRON.frequence_reward_amount();

    assert.equal(frequenceRewardAmount, FREQUENCE_REWARD_AMOUNT, 'Frequence reward amount should be 500 TIIM Token');
  })

  it('Non owner should not be able to set frequence reward amount', async () => {
    try{
    
      await REWARD_PATRON.setFrequenceRewardAmount(FREQUENCE_REWARD_AMOUNT, {from: NON_OWNER});
    
      assert(false, 'Should not come here');
    }catch (err) {
      assert.include(err.message, 'invalid address');
    }
  })

  it('XXX Non owner should not be able to set minimum staking amount', async () =>{

    await REWARD_PATRON.setMinimumStakingAmount(50, {from: NON_OWNER});

    const reward = await REWARD_PATRON.minimum_staking_amount()

    console.log(reward)

    // try{
    //   await REWARD_PATRON.setMinimumStakingAmount(50, {from: NON_OWNER});

    //   assert(false, 'Should not come here');

    // }catch(err) {
    //   console.log('asdjashdasd', err);
    // }
  })


});
