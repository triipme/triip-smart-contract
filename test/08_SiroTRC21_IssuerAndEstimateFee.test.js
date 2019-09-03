const SIROToken = artifacts.require("SIROToken");
const PercentageFeeSchemeContract = artifacts.require("PercentageFeeScheme");
const FixedFeeSchemeContract = artifacts.require("FixedFeeScheme");

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
let FIXED_FEE_SCHEME;

contract("SIROToken", accounts => {
  describe("Test Issuer TRC21", async () => {
    beforeEach("SIRO Token init with valid Fee Scheme address", async () => {
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
        it("issuer should be deployer address", async () => {
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

  describe("Test estimateFee TRC21", async () => {
    describe("when deploy SIRO token", async () => {
      describe("given 0 address for Fee Scheme", async () => {
        it("should receive error message", async () => {
          DEPLOYER = COMMUNITY_WALLET = accounts[0];
          CROWD_FUNDING_WALLET = accounts[1];
          ECO_WALLET = accounts[2];
          COMPANY_WALLET = accounts[3];
          TEAM_WALLET = accounts[4];
          FOUNDER_WALLET = accounts[5];
          TOMO_ALLOCATION_WALLET = accounts[6];

          try {
            await SIROToken.new(
              COMMUNITY_WALLET,
              CROWD_FUNDING_WALLET,
              ECO_WALLET,
              COMPANY_WALLET,
              TEAM_WALLET,
              FOUNDER_WALLET,
              TOMO_ALLOCATION_WALLET,
              0
            );
            assert(false, "Should not come here");
          } catch (err) {
            assert.include(
              err.message,
              "Fee scheme address must not be address of Zero"
            );
          }
        });
      });

      describe("given 1% Percentage Fee Scheme address for Fee Scheme", async () => {
        describe("should deploy success", async () => {
          it("estimate fee for 100 should be 1", async () => {
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

            let fee = await SIRO.estimateFee(100);
            assert.equal(fee, 1);
          });
        });
      });

      describe("given 5 Token Fixed Fee Scheme address for Fee Scheme", async () => {
        describe("should deploy success", async () => {
          it("estimate fee for 100 should be 5", async () => {
            DEPLOYER = COMMUNITY_WALLET = accounts[0];
            CROWD_FUNDING_WALLET = accounts[1];
            ECO_WALLET = accounts[2];
            COMPANY_WALLET = accounts[3];
            TEAM_WALLET = accounts[4];
            FOUNDER_WALLET = accounts[5];
            TOMO_ALLOCATION_WALLET = accounts[6];
            FIXED_FEE_SCHEME = await FixedFeeSchemeContract.new();

            await FIXED_FEE_SCHEME.setFee(5 * UNIT)

            SIRO = await SIROToken.new(
              COMMUNITY_WALLET,
              CROWD_FUNDING_WALLET,
              ECO_WALLET,
              COMPANY_WALLET,
              TEAM_WALLET,
              FOUNDER_WALLET,
              TOMO_ALLOCATION_WALLET,
              FIXED_FEE_SCHEME.address
            );

            let fee = await SIRO.estimateFee(100 * UNIT);
            assert.equal(fee, 5 * UNIT);
          });
        });
      });
    });
  });
});
