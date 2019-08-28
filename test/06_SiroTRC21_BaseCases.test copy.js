// "0xF0187348678403ED9457B1B3dF316f2eD384463a","0x68235e990ec444E1247c0Bf236CdebEC75051Ffb","0x9eda1F9783adB23eC8d52525C7117Cd210DdAfDc","0x235AC69192a21952949358126177Fa4bb86e0184","0x7c240374515fbfd6a2448D7d720635028f7a822E","0xC320a067133695D9a10499d621314b8B116A5c5e","0x6550a3C13c02c9e7EFa0571813aE53714E8B866B"

const SIROToken = artifacts.require('SIROToken');


const {
  MILLION,
  UNIT,
  TRANSFER_GAS,
  TOTAL_SUPPLY,
  increaseTime,
  sendEth,
  duration
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

  it('Token sale wallet should be 75m', async () => {
    const balance = await SIRO.balanceOf(CROWD_FUNDING_WALLET);

    assert.equal(balance.valueOf(), 75 * MILLION * UNIT, 'Token sale wallet should have 75m');
  });

  it('Eco Wallet should be 75m', async () => {
    const balance = await SIRO.balanceOf(ECO_WALLET);

    assert.equal(balance.valueOf(), 75 * MILLION * UNIT, 'ECO Wallet should have 75m');
  });  

  it('Company Wallet should be 85m', async () => {
    const balance = await SIRO.balanceOf(COMPANY_WALLET);

    assert.equal(balance.valueOf(), 85 * MILLION * UNIT, 'Company Wallet should have 85m');
  });  
  
  it('Team vesting should be 45m = 9%', async () => {
    const balance = await SIRO.teamAllocation();

    assert.equal(balance.valueOf(), 45 * MILLION * UNIT, 'Team vesting should have 45m');
  });

  it('Founder vesting should be 5m = 1%', async () => {
    const balance = await SIRO.founderAllocation();

    assert.equal(balance.valueOf(), 5 * MILLION * UNIT, 'Team vesting should have 5m');
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




const teamAllocation = 45 * MILLION;
const founderAllocation = 5 * MILLION;




contract("SIROToken team vesting", accounts => {
    
    beforeEach("SIRO Token init", async () => {

      COMMUNITY_WALLET = accounts[0];
      CROWD_FUNDING_WALLET = accounts[1];
      ECO_WALLET = accounts[2];
      COMPANY_WALLET = accounts[3];
      TEAM_WALLET = accounts[4];
      FOUNDER_WALLET = accounts[5];
      ANONYMOUS = accounts[7];
  
      owner = accounts[0];
      nonOwner = accounts[9];
  
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
  
    it("Anomyous call release team or founder token should get error message", async () => {
      try {
        await SIRO.releaseTeamTokens({ from: ANONYMOUS });
  
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(err.message, "revert");
      }
  
      try {
        await SIRO.releaseFounderTokens({ from: ANONYMOUS });
  
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(err.message, "revert");
      }
    });
  
    it("Max team release Tranches should be 12", async () => {
      const tranches = await SIRO.maxTeamTranches();
  
      assert.equal(tranches, 12);
    });
  
    it("Team allocated should be zero when token was setup", async () => {
      const allocated = await SIRO.totalTeamAllocated();
  
      assert.equal(allocated, 0);
    });
  
    it("Release team tokens one period", async () => {
      const expectedAllocation = 45000000 / 12;
  
      // ensure team allocated is 0
      let teamAllocated = await SIRO.totalTeamAllocated();
      assert.equal(teamAllocated, 0);
  
      await increaseTime(duration.days(40));
  
      // actually call release team tokens
      const tx = await SIRO.releaseTeamTokens({ from: owner });
  
      const transferedEvent = tx.logs[0].args;
      const releasedEvent = tx.logs[1].args;
  
      assert.equal(fromWei(releasedEvent.amount.valueOf()), expectedAllocation);
  
      assert.equal(transferedEvent.from, 0x0);
      assert.equal(transferedEvent.to, TEAM_WALLET);
      assert.equal(fromWei(transferedEvent.value), expectedAllocation);
  
      // assert team balance
      let teamBalance = await SIRO.balanceOf(TEAM_WALLET);
      teamBalance = fromWei(teamBalance);
      assert.equal(
        parseFloat(teamBalance),
        expectedAllocation,
        "Should allocated 4166666.666666666666666666 SIRO token"
      );
  
      // assert team released tranches
      const releasedTranches = await SIRO.teamTranchesReleased();
      assert.equal(releasedTranches, 1, "Released tranches should increas to 1");
  
      // assert team allocated
      teamAllocated = await SIRO.totalTeamAllocated();
      teamAllocated = fromWei(teamAllocated);
      assert.equal(parseFloat(teamAllocated), expectedAllocation);
    });
  
    it("Release team tokens when passed three periods", async () => {
      const expectedAllocation = (45000000 / 12) * 3;
  
      // ensure team allocated is 0
      let teamAllocated = await SIRO.totalTeamAllocated();
      assert.equal(
        teamAllocated,
        0,
        "Team allocated should be 0 before any released"
      );
  
      // given passed three periods already
      await increaseTime(duration.days(30));
      await increaseTime(duration.days(30));
      await increaseTime(duration.days(30));
  
      // actually call release team tokens
      await SIRO.releaseTeamTokens({ from: owner });
      await SIRO.releaseTeamTokens({ from: owner });
      await SIRO.releaseTeamTokens({ from: owner });
  
      // assert team balance
      let teamBalance = await SIRO.balanceOf(TEAM_WALLET);
      teamBalance = fromWei(teamBalance);
      assert.equal(
        parseFloat(teamBalance),
        expectedAllocation,
        "Should allocated 12.5m SIRO token"
      );
  
      // assert team released tranches
      const releasedTranches = await SIRO.teamTranchesReleased();
      assert.equal(releasedTranches, 3, "Released tranches should increas to 3");
  
      // assert team allocated
      teamAllocated = await SIRO.totalTeamAllocated();
      teamAllocated = fromWei(teamAllocated);
      assert.equal(parseFloat(teamAllocated), expectedAllocation);
    });
  
    it("Release all team tokens", async () => {
      const expectedAllocation = teamAllocation;
  
      // ensure team allocated is 0
      let teamAllocated = await SIRO.totalTeamAllocated();
      assert.equal(
        teamAllocated,
        0,
        "Team allocated should be 0 before any released"
      );
  
      // given passed all period already
      for (let i = 0; i < 12; i++) await increaseTime(duration.days(30));
  
      // release whole team allocation
      for (let i = 0; i < 12; i++) await SIRO.releaseTeamTokens({ from: owner });
  
      // assert team balance
      let teamBalance = await SIRO.balanceOf(TEAM_WALLET);
      teamBalance = fromWei(teamBalance);
      assert.equal(
        parseFloat(teamBalance),
        expectedAllocation,
        "Should allocated 50m SIRO token"
      );
  
      // assert team released tranches
      const releasedTranches = await SIRO.teamTranchesReleased();
      assert.equal(
        releasedTranches,
        12,
        "Released tranches should increas to 12"
      );
  
      // assert team allocated
      teamAllocated = await SIRO.totalTeamAllocated();
      teamAllocated = fromWei(teamAllocated);
      assert.equal(parseFloat(teamAllocated), expectedAllocation);
    });
  
    it("Should throw error when trying to release team tokens after reached max tranches", async () => {
      const expectedAllocation = teamAllocation;
      // given passed 15 periods
      for (let i = 0; i < 15; i++) await increaseTime(duration.days(30));
  
      // release whole team allocation
      for (let i = 0; i < 12; i++) await SIRO.releaseTeamTokens({ from: owner });
  
      // assert team balance
      let teamBalance = await SIRO.balanceOf(TEAM_WALLET);
      teamBalance = fromWei(teamBalance);

      assert.equal(
        teamBalance,
        expectedAllocation,
        "Should allocated 45m SIRO token"
      );
      // trying to release more team tokens
      try {
        await SIRO.releaseTeamTokens({ from: owner });
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(
          err.message,
          "revert"
        );
      }
    });
  
    it("Should throw error when non-owner try to release team tokens", async () => {
      try {
        await SIRO.releaseTeamTokens({ from: nonOwner });
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(err.message, "revert");
      }
    });
  });
  
  contract("SIROToken founder vesting", accounts => {
    beforeEach("SIRO Token init", async () => {
      COMMUNITY_WALLET = accounts[0];
      CROWD_FUNDING_WALLET = accounts[1];
      ECO_WALLET = accounts[2];
      COMPANY_WALLET = accounts[3];
      TEAM_WALLET = accounts[4];
      FOUNDER_WALLET = accounts[5];
      ANONYMOUS = accounts[7];
  
      owner = accounts[0];
      nonOwner = accounts[9];
  
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
  
    it("Founder allocation should be 5m", async () => {
      const founderAllocation = await SIRO.founderAllocation();
      assert.equal(fromWei(founderAllocation.valueOf()), 5 * MILLION);
    });
  
    it("Max founder release Tranches should be 24", async () => {
      const tranches = await SIRO.maxFounderTranches();
  
      assert.equal(tranches, 24);
    });
  
    it("Founder allocated should be zero when token was setup", async () => {
      const allocated = await SIRO.totalFounderAllocated();
  
      assert.equal(allocated, 0);
    });
  
    it("Release founder tokens one period", async () => {
      const expectedAllocation = 5000000 / 24;
  
      // ensure founder allocated is 0
      let founderAllocated = await SIRO.totalFounderAllocated();
      assert.equal(founderAllocated, 0);
  
      await increaseTime(duration.days(40));
  
      // actually call release founder tokens
      const tx = await SIRO.releaseFounderTokens({ from: owner });
  
      // console.log("abc: ", tx);
  
      const transferedEvent = tx.logs[0].args;
      const releasedEvent = tx.logs[1].args;
  
      assert.equal(fromWei(releasedEvent.amount.valueOf()), expectedAllocation);
  
      assert.equal(transferedEvent.from, 0x0);
      assert.equal(transferedEvent.to, FOUNDER_WALLET);
      assert.equal(fromWei(transferedEvent.value), expectedAllocation);
  
      // assert founder balance
      let founderBalance = await SIRO.balanceOf(FOUNDER_WALLET);
      founderBalance = fromWei(founderBalance);
      assert.equal(
        founderBalance,
        expectedAllocation,
        "Should allocated 416,666.666666667 SIRO token"
      );
  
      // assert founder released tranches
      const releasedTranches = await SIRO.founderTranchesReleased();
      assert.equal(releasedTranches, 1, "Released tranches should increas to 1");
  
      // assert founder allocated
      founderAllocated = await SIRO.totalFounderAllocated();
      founderAllocated = fromWei(founderAllocated);
      assert.equal(founderAllocated, expectedAllocation);
    });
  
    it("Release founder tokens when passed six periods", async () => {
      const expectedAllocation = (5000000 / 24) * 6; // 
  
      // ensure founder allocated is 0
      let founderAllocated = await SIRO.totalFounderAllocated();
      assert.equal(
        founderAllocated,
        0,
        "Founder allocated should be 0 before any released"
      );
  
      // pass end ICO
      increaseTime(duration.days(10));
  
      // given passed three periods already
      for (var i = 0; i < 6; i++) {
        await increaseTime(duration.days(30));
      }
  
      // actually call release founder tokens
      for (var i = 0; i < 6; i++) {
        await SIRO.releaseFounderTokens({ from: owner });
      }
  
      // assert founder balance
      let founderBalance = await SIRO.balanceOf(FOUNDER_WALLET);
      founderBalance = fromWei(founderBalance);
      assert.equal(
        founderBalance,
        expectedAllocation,
        "Should allocated 250,000 SIRO token"
      );
  
      // assert founder released tranches
      const releasedTranches = await SIRO.founderTranchesReleased();
      assert.equal(releasedTranches, 6, "Released tranches should increas to 6");
  
      // assert founder allocated
      founderAllocated = await SIRO.totalFounderAllocated();
      founderAllocated = fromWei(founderAllocated);
      assert.equal(parseFloat(founderAllocated), expectedAllocation);
    });
  
    it("Release all founder tokens", async () => {
      const expectedAllocation = founderAllocation;
  
      // ensure founder allocated is 0
      let founderAllocated = await SIRO.totalFounderAllocated();
      assert.equal(
        founderAllocated,
        0,
        "Founder allocated should be 0 before any released"
      );
  
      // pass end ICO
      await increaseTime(duration.days(10));
  
      // given passed all period already
      for (let i = 0; i < 24; i++) await increaseTime(duration.days(30));
  
      // release whole founder allocation
      for (let i = 0; i < 24; i++)
        await SIRO.releaseFounderTokens({ from: owner });
  
      // assert founder balance
      let founderBalance = await SIRO.balanceOf(FOUNDER_WALLET);
      founderBalance = fromWei(founderBalance);
      assert.equal(
        founderBalance,
        expectedAllocation,
        "Should allocated 10m SIRO token"
      );
  
      // assert founder released tranches
      const releasedTranches = await SIRO.founderTranchesReleased();
      assert.equal(
        releasedTranches,
        24,
        "Released tranches should increas to 24"
      );
  
      // assert founder allocated
      founderAllocated = await SIRO.totalFounderAllocated();
      founderAllocated = fromWei(founderAllocated);
      assert.equal(founderAllocated, expectedAllocation);
    });
  
    it("Should throw error when trying to release founder tokens after reached max tranches", async () => {
      const expectedAllocation = founderAllocation;
  
      // given passed 30 periods
      for (let i = 0; i < 30; i++) await increaseTime(duration.days(30));
  
      // release whole founder allocation
      for (let i = 0; i < 24; i++)
        await SIRO.releaseFounderTokens({ from: owner });
  
      // assert founder balance
      let founderBalance = await SIRO.balanceOf(FOUNDER_WALLET);
      founderBalance = fromWei(founderBalance);
      assert.equal(
        founderBalance,
        expectedAllocation,
        "Should allocated 5m SIRO token"
      );
  
      // trying to release more founder tokens
      try {
        await SIRO.releaseFounderTokens({ from: owner });
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(err.message,"revert");
      }
    });
  
    it("Should throw error when non-owner try to release founder tokens", async () => {
      try {
        await SIRO.releaseFounderTokens({ from: nonOwner });
        assert(false, "Should not come here");
      } catch (err) {
        assert.include(err.message, "revert");
      }
    });
  });
  