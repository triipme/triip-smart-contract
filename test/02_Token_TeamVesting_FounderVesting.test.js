const TIIMToken = artifacts.require("TIIMToken");

const {
  MILLION,
  UNIT,
  TRANSFER_GAS,
  TOTAL_SUPPLY,
  increaseTime,
  duration
} = require("../lib/utils");

let TIIM;

let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let ANONYMOUS;
let owner;
let nonOwner;

const teamAllocation = 40 * MILLION;
const founderAllocation = 10 * MILLION;

contract("TIIMToken team vesting", accounts => {
  beforeEach("TIIM Token init", async () => {
    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    ANONYMOUS = accounts[7];

    owner = accounts[0];
    nonOwner = accounts[9];

    TIIM = await TIIMToken.new(
      COMMUNITY_WALLET,
      CROWD_FUNDING_WALLET,
      ECO_WALLET,
      COMPANY_WALLET,
      TEAM_WALLET,
      FOUNDER_WALLET
    );
  });

  it("Anomyous call release team or founder token should get error message", async () => {
    try {
      await TIIM.releaseTeamTokens({ from: ANONYMOUS });

      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "revert");
    }

    try {
      await TIIM.releaseFounderTokens({ from: ANONYMOUS });

      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "revert");
    }
  });

  it("Team allocation should be 40m", async () => {
    const teamAllocation = await TIIM.teamAllocation();
    assert.equal(fromWei(teamAllocation.valueOf()), 40 * MILLION);
  });

  it("Max team release Tranches should be 12", async () => {
    const tranches = await TIIM.maxTeamTranches();

    assert.equal(tranches, 12);
  });

  it("Team allocated should be zero when token was setup", async () => {
    const allocated = await TIIM.totalTeamAllocated();

    assert.equal(allocated, 0);
  });

  it("Release team tokens one period", async () => {
    const expectedAllocation = 40000000 / 12;

    // ensure team allocated is 0
    let teamAllocated = await TIIM.totalTeamAllocated();
    assert.equal(teamAllocated, 0);

    await increaseTime(duration.days(40));

    // actually call release team tokens
    const tx = await TIIM.releaseTeamTokens({ from: owner });

    const transferedEvent = tx.logs[0].args;
    const releasedEvent = tx.logs[1].args;

    assert.equal(fromWei(releasedEvent.amount.valueOf()), expectedAllocation);

    assert.equal(transferedEvent.from, 0x0);
    assert.equal(transferedEvent.to, TEAM_WALLET);
    assert.equal(fromWei(transferedEvent.value), expectedAllocation);

    // assert team balance
    let teamBalance = await TIIM.balanceOf(TEAM_WALLET);
    teamBalance = fromWei(teamBalance);
    assert.equal(
      parseFloat(teamBalance),
      expectedAllocation,
      "Should allocated 4166666.666666666666666666 TIIM token"
    );

    // assert team released tranches
    const releasedTranches = await TIIM.teamTranchesReleased();
    assert.equal(releasedTranches, 1, "Released tranches should increas to 1");

    // assert team allocated
    teamAllocated = await TIIM.totalTeamAllocated();
    teamAllocated = fromWei(teamAllocated);
    assert.equal(parseFloat(teamAllocated), expectedAllocation);
  });

  it("Release team tokens when passed three periods", async () => {
    const expectedAllocation = (40000000 / 12) * 3;

    // ensure team allocated is 0
    let teamAllocated = await TIIM.totalTeamAllocated();
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
    await TIIM.releaseTeamTokens({ from: owner });
    await TIIM.releaseTeamTokens({ from: owner });
    await TIIM.releaseTeamTokens({ from: owner });

    // assert team balance
    let teamBalance = await TIIM.balanceOf(TEAM_WALLET);
    teamBalance = fromWei(teamBalance);
    assert.equal(
      parseFloat(teamBalance),
      expectedAllocation,
      "Should allocated 12.5m TIIM token"
    );

    // assert team released tranches
    const releasedTranches = await TIIM.teamTranchesReleased();
    assert.equal(releasedTranches, 3, "Released tranches should increas to 3");

    // assert team allocated
    teamAllocated = await TIIM.totalTeamAllocated();
    teamAllocated = fromWei(teamAllocated);
    assert.equal(parseFloat(teamAllocated), expectedAllocation);
  });

  it("Release all team tokens", async () => {
    const expectedAllocation = teamAllocation;

    // ensure team allocated is 0
    let teamAllocated = await TIIM.totalTeamAllocated();
    assert.equal(
      teamAllocated,
      0,
      "Team allocated should be 0 before any released"
    );

    // given passed all period already
    for (let i = 0; i < 12; i++) await increaseTime(duration.days(30));

    // release whole team allocation
    for (let i = 0; i < 12; i++) await TIIM.releaseTeamTokens({ from: owner });

    // assert team balance
    let teamBalance = await TIIM.balanceOf(TEAM_WALLET);
    teamBalance = fromWei(teamBalance);
    assert.equal(
      parseFloat(teamBalance),
      expectedAllocation,
      "Should allocated 50m TIIM token"
    );

    // assert team released tranches
    const releasedTranches = await TIIM.teamTranchesReleased();
    assert.equal(
      releasedTranches,
      12,
      "Released tranches should increas to 12"
    );

    // assert team allocated
    teamAllocated = await TIIM.totalTeamAllocated();
    teamAllocated = fromWei(teamAllocated);
    assert.equal(parseFloat(teamAllocated), expectedAllocation);
  });

  it("Should throw error when trying to release team tokens after reached max tranches", async () => {
    const expectedAllocation = teamAllocation;
    // given passed 15 periods
    for (let i = 0; i < 15; i++) await increaseTime(duration.days(30));

    // release whole team allocation
    for (let i = 0; i < 12; i++) await TIIM.releaseTeamTokens({ from: owner });

    // assert team balance
    let teamBalance = await TIIM.balanceOf(TEAM_WALLET);
    teamBalance = fromWei(teamBalance);
    assert.equal(
      teamBalance,
      expectedAllocation,
      "Should allocated 50m TIIM token"
    );
    // trying to release more team tokens
    try {
      await TIIM.releaseTeamTokens({ from: owner });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Released times should less than max release times definition"
      );
    }
  });

  it("Should throw error when non-owner try to release team tokens", async () => {
    try {
      await TIIM.releaseTeamTokens({ from: nonOwner });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "revert");
    }
  });
});

contract("TIIMToken founder vesting", accounts => {
  beforeEach("TIIM Token init", async () => {
    COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    ANONYMOUS = accounts[7];

    owner = accounts[0];
    nonOwner = accounts[9];

    TIIM = await TIIMToken.new(
      COMMUNITY_WALLET,
      CROWD_FUNDING_WALLET,
      ECO_WALLET,
      COMPANY_WALLET,
      TEAM_WALLET,
      FOUNDER_WALLET
    );
  });

  it("Founder allocation should be 10m", async () => {
    const founderAllocation = await TIIM.founderAllocation();
    assert.equal(fromWei(founderAllocation.valueOf()), 10 * MILLION);
  });

  it("Max founder release Tranches should be 24", async () => {
    const tranches = await TIIM.maxFounderTranches();

    assert.equal(tranches, 24);
  });

  it("Founder allocated should be zero when token was setup", async () => {
    const allocated = await TIIM.totalFounderAllocated();

    assert.equal(allocated, 0);
  });

  it("Release founder tokens one period", async () => {
    const expectedAllocation = 10000000 / 24;

    // ensure founder allocated is 0
    let founderAllocated = await TIIM.totalFounderAllocated();
    assert.equal(founderAllocated, 0);

    await increaseTime(duration.days(40));

    // actually call release founder tokens
    const tx = await TIIM.releaseFounderTokens({ from: owner });

    // console.log("abc: ", tx);

    const transferedEvent = tx.logs[0].args;
    const releasedEvent = tx.logs[1].args;

    assert.equal(fromWei(releasedEvent.amount.valueOf()), expectedAllocation);

    assert.equal(transferedEvent.from, 0x0);
    assert.equal(transferedEvent.to, FOUNDER_WALLET);
    assert.equal(fromWei(transferedEvent.value), expectedAllocation);

    // assert founder balance
    let founderBalance = await TIIM.balanceOf(FOUNDER_WALLET);
    founderBalance = fromWei(founderBalance);
    assert.equal(
      founderBalance,
      expectedAllocation,
      "Should allocated 416,666.666666667 TIIM token"
    );

    // assert founder released tranches
    const releasedTranches = await TIIM.founderTranchesReleased();
    assert.equal(releasedTranches, 1, "Released tranches should increas to 1");

    // assert founder allocated
    founderAllocated = await TIIM.totalFounderAllocated();
    founderAllocated = fromWei(founderAllocated);
    assert.equal(founderAllocated, expectedAllocation);
  });

  it("Release founder tokens when passed six periods", async () => {
    const expectedAllocation = (10000000 / 24) * 6; // 250,000

    // ensure founder allocated is 0
    let founderAllocated = await TIIM.totalFounderAllocated();
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
      await TIIM.releaseFounderTokens({ from: owner });
    }

    // assert founder balance
    let founderBalance = await TIIM.balanceOf(FOUNDER_WALLET);
    founderBalance = fromWei(founderBalance);
    assert.equal(
      founderBalance,
      expectedAllocation,
      "Should allocated 250,000 TIIM token"
    );

    // assert founder released tranches
    const releasedTranches = await TIIM.founderTranchesReleased();
    assert.equal(releasedTranches, 6, "Released tranches should increas to 6");

    // assert founder allocated
    founderAllocated = await TIIM.totalFounderAllocated();
    founderAllocated = fromWei(founderAllocated);
    assert.equal(parseFloat(founderAllocated), expectedAllocation);
  });

  it("Release all founder tokens", async () => {
    const expectedAllocation = founderAllocation;

    // ensure founder allocated is 0
    let founderAllocated = await TIIM.totalFounderAllocated();
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
      await TIIM.releaseFounderTokens({ from: owner });

    // assert founder balance
    let founderBalance = await TIIM.balanceOf(FOUNDER_WALLET);
    founderBalance = fromWei(founderBalance);
    assert.equal(
      founderBalance,
      expectedAllocation,
      "Should allocated 10m TIIM token"
    );

    // assert founder released tranches
    const releasedTranches = await TIIM.founderTranchesReleased();
    assert.equal(
      releasedTranches,
      24,
      "Released tranches should increas to 24"
    );

    // assert founder allocated
    founderAllocated = await TIIM.totalFounderAllocated();
    founderAllocated = fromWei(founderAllocated);
    assert.equal(founderAllocated, expectedAllocation);
  });

  it("Should throw error when trying to release founder tokens after reached max tranches", async () => {
    const expectedAllocation = founderAllocation;

    // given passed 30 periods
    for (let i = 0; i < 30; i++) await increaseTime(duration.days(30));

    // release whole founder allocation
    for (let i = 0; i < 24; i++)
      await TIIM.releaseFounderTokens({ from: owner });

    // assert founder balance
    let founderBalance = await TIIM.balanceOf(FOUNDER_WALLET);
    founderBalance = fromWei(founderBalance);
    assert.equal(
      founderBalance,
      expectedAllocation,
      "Should allocated 10m TIIM token"
    );

    // trying to release more founder tokens
    try {
      await TIIM.releaseFounderTokens({ from: owner });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(
        err.message,
        "Released times should less than max release times definition"
      );
    }
  });

  it("Should throw error when non-owner try to release founder tokens", async () => {
    try {
      await TIIM.releaseFounderTokens({ from: nonOwner });
      assert(false, "Should not come here");
    } catch (err) {
      assert.include(err.message, "Only owner able to call this function");
    }
  });
});
