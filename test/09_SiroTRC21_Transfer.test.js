const SIROToken = artifacts.require("SIROToken");
const PercentageFeeSchemeContract = artifacts.require("PercentageFeeScheme");
const FixedFeeSchemeContract = artifacts.require("FixedFeeScheme");

const { MILLION, UNIT } = require("../lib/utils");

let SIRO;

let OWNER;
let COMMUNITY_WALLET;
let CROWD_FUNDING_WALLET;
let ECO_WALLET;
let COMPANY_WALLET;
let TEAM_WALLET;
let FOUNDER_WALLET;
let TOMO_ALLOCATION_WALLET;
let PERCENTAGE_FEE_SCHEME;
let FIXED_FEE_SCHEME;
let NORMAL_CLIENT;
let ANONYMOUS;

contract("SIROToken", accounts => {
  beforeEach("SIRO Token init", async () => {
    OWNER = accounts[0];

    CROWD_FUNDING_WALLET = accounts[1];
    ECO_WALLET = accounts[2];
    COMPANY_WALLET = accounts[3];
    TEAM_WALLET = accounts[4];
    FOUNDER_WALLET = accounts[5];
    TOMO_ALLOCATION_WALLET = accounts[6];
    COMMUNITY_WALLET = accounts[7];
    NORMAL_CLIENT = accounts[8];
    ANONYMOUS = accounts[9];

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

  describe("#transfer", async () => {
    it("sends 100m value - issuer should receive 1m token fee", async () => {
      // when
      let tx = await SIRO.transfer(FOUNDER_WALLET, 100 * MILLION, {
        from: CROWD_FUNDING_WALLET
      });
      let fee = tx.logs[1].args.value.valueOf();
      let feeReceiver = tx.logs[1].args.issuer;
      let balanceIssuer = await SIRO.balanceOf(OWNER);

      // then
      assert.equal(fee, 1 * MILLION);
      assert.equal(feeReceiver, OWNER);
      assert.equal(balanceIssuer, 1 * MILLION);
    });

    describe("when balance < value", async () => {
      it("Should receive error message - Balance of sender should greater than or equals with sending amount", async () => {
        try {
          await SIRO.transfer(FOUNDER_WALLET, 10000 * MILLION * UNIT, {
            from: CROWD_FUNDING_WALLET
          });
          assert(false, "Should not come here");
        } catch (err) {
          assert.include(
            err.message,
            "Balance of sender should greater than or equals with sending amount"
          );
        }
      });
    });

    describe("when to is address 0", async () => {
      it("should receive error message - Receiver address must not be Zero", async () => {
        try {
          await SIRO.transfer(0, 100 * MILLION, {
            from: CROWD_FUNDING_WALLET
          });
          assert(false, "Should not come here");
        } catch (err) {
          assert.include(err.message, "Receiver address must not be Zero");
        }
      });
    });

    describe("Given fixed fee scheme", async () => {
      beforeEach("Setup Token with fxied fee scheme", async () => {
        OWNER = accounts[0];

        CROWD_FUNDING_WALLET = accounts[1];
        ECO_WALLET = accounts[2];
        COMPANY_WALLET = accounts[3];
        TEAM_WALLET = accounts[4];
        FOUNDER_WALLET = accounts[5];
        TOMO_ALLOCATION_WALLET = accounts[6];
        COMMUNITY_WALLET = accounts[7];

        FIXED_FEE_SCHEME = await FixedFeeSchemeContract.new();
        await FIXED_FEE_SCHEME.setFee(0 * UNIT);

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

        SIRO.unpause();

        await SIRO.transfer(NORMAL_CLIENT, 105 * UNIT, {
          from: CROWD_FUNDING_WALLET
        });
      });

      describe("when set fixed fee is 5 Token", async () => {
        beforeEach("Set fixed fee 5 token", async () => {
          await FIXED_FEE_SCHEME.setFee(5 * UNIT);
        });
        describe("when balance is 100 token and greater than fee", async () => {
          describe("sends 50 Token", async () => {
            it("fee should be 5 Token", async () => {
              let tx = await SIRO.transfer(OWNER, 50 * UNIT, {
                from: NORMAL_CLIENT
              });

              let fee = tx.logs[1].args.value.valueOf();
              assert.equal(fee, 5 * UNIT);
            });

            it("should receive TRC21 Fee event", async () => {
              let tx = await SIRO.transfer(OWNER, 50 * UNIT, {
                from: NORMAL_CLIENT
              });

              let logs = tx.logs;
              assert.equal(logs.length, 2);

              let transfer = logs[0];
              let fee = logs[1];

              // assert transfer event
              assert.equal(transfer.event, "Transfer");
              assert.equal(transfer.args.value.valueOf(), 45 * UNIT);

              // assert fee event
              assert.equal(fee.event, "Fee");
              assert.equal(fee.args.from, NORMAL_CLIENT);
              assert.equal(fee.args.to, OWNER);
              assert.equal(fee.args.issuer, OWNER);
              assert.equal(fee.args.value.valueOf(), 5 * UNIT);
            });
          });
        });
        describe("when balance is 3 token and less than fee", async () => {
          beforeEach("reduce NORMAL_CLIENT balance 97 token", async () => {
            await SIRO.transfer(OWNER, 92 * UNIT, { from: NORMAL_CLIENT });
          });
          describe("sends 2 Token", async () => {
            it("should receive error message - invalid opcode", async () => {
              try {
                await SIRO.transfer(OWNER, 2 * UNIT, {
                  from: NORMAL_CLIENT
                });
                assert(false, "Should not come here");
              } catch (err) {
                assert.include(err.message, "invalid opcode");
              }
            });
          });
        });
      });

      describe("when set fixed fee is 0 token", async () => {
        beforeEach("Set fee = 0", async () => {
          await FIXED_FEE_SCHEME.setFee(0 * UNIT);
        });
        it("sends 100 Token should receive 100 Token", async () => {
          let tx = await SIRO.transfer(ANONYMOUS, 100 * UNIT, {
            from: CROWD_FUNDING_WALLET
          });

          let balance = await SIRO.balanceOf(ANONYMOUS);

          assert.equal(balance.valueOf(), 100 * UNIT);
        });

        it("sends 100 Token should not receive TRC21 Fee event", async () => {
          let tx = await SIRO.transfer(ANONYMOUS, 100 * UNIT, {
            from: CROWD_FUNDING_WALLET
          });
          let logs = tx.logs;
          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, "Transfer");
        });
      });
    });
  });

  describe("#transferAndCall", async () => {});
});
