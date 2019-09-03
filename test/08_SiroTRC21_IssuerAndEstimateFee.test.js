const SIROToken = artifacts.require("SIROToken");
const PercentageFeeSchemeContract = artifacts.require("PercentageFeeScheme");

const { MILLION, UNIT } = require("../lib/utils");

let SIRO;

let DEPLOYER;
let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let TOMO_ALLOCATION_WALLET;
let PERCENTAGE_FEE_SCHEME;

contract("SIROToken", accounts => {
  beforeEach("SIRO Token init", async () => {
    DEPLOYER = COMMUNITY_WALLET = accounts[0];
    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    TOMO_ALLOCATION_WALLET = accounts[6];

    PERCENTAGE_FEE_SCHEME = await PercentageFeeSchemeContract.new();

    SIRO = await SIROToken.new(
      COMMUNITY_WALLET,
      CROWD_FUNDING_WALLET,
      ECO_WALLET,
      COMPANY_WALLET,
      TEAM_WALLET,
      FOUNDER_WALLET,
      TOMO_ALLOCATION_WALLET,
      PERCENTAGE_FEE_SCHEME.address
    );

    SIRO.unpause();
  });

  describe("#issuer", async () => {
    describe("when deploying token contract", async () => {
      it("issuer should be deployer", async () => {
        let issuer = await SIRO.issuer();
        assert.equal(issuer, DEPLOYER);
      });
    });
  });

  describe("#changeIssuer", async () => {
    describe("when owner change issuer", async () => {
      describe("given 0 address", async () => {
        it("should receive error message", async () => {
          try {
            await SIRO.changeIssuer(0);
            assert(false, "should not come here");
          } catch (err) {
            assert.include(
              err.message,
              "New issuer address must not be address of Zero"
            );
          }
        });
      });
      describe("given real address", async () => {
        it("should receive event IssuerTransferred and issuer changed", async () => {
          // given
          let currentIssuer = DEPLOYER;
          let newIssuer = FOUNDER_WALLET;

          // when
          let tx = await SIRO.changeIssuer(newIssuer);
          let eventIssuerTransferred = tx.logs[0];

          // then expect fired event
          assert.equal(eventIssuerTransferred.args._issuer, currentIssuer);
          assert.equal(eventIssuerTransferred.args._new_issuer, newIssuer);

          // then expect new issuer address is Founder wallet
          let issuer = await SIRO.issuer();
          assert.equal(issuer, FOUNDER_WALLET);
        });
      });
    });
  });
});
