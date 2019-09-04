const SIROToken = artifacts.require("SIROToken");
const PercentageFeeSchemeContract = artifacts.require("PercentageFeeScheme");
const FixedFeeSchemeContract = artifacts.require("FixedFeeScheme");
const MockedBookingReceiverFixedFee = artifacts.require("MockedBookingReceiverFixedFee");
const MockedBookingReceiverZeroFee = artifacts.require("MockedBookingReceiverZeroFee");

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
let MOCKED_BOOKING_RECEIVER_FIXED_FEE;
let MOCKED_BOOKING_RECEIVER_ZERO_FEE;
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

  describe("#transferAndCall", async () => {
    describe("when value > balance", async () => {
      it("should receive error message - Balance of sender must be greater than or equals with sending amount", async () => {
        try {
          await SIRO.transferAndCall(0, 100, web3.fromAscii("123"));
          assert(false, "Should not come here");
        } catch (err) {
          assert.include(
            err.message,
            "Balance of sender must be greater than or equals with sending amount"
          );
        }
      });
    });

    describe("when receiver's address is Zero", async () => {
      it("should receive error message - Receiver's address should not be Zero", async () => {
        try {
          await SIRO.transferAndCall(0, 100, web3.fromAscii("123"), {
            from: COMMUNITY_WALLET
          });
          assert(false, "Should not come here");
        } catch (err) {
          assert.include(
            err.message,
            "Contract receiver's address should not be Zero"
          );
        }
      });
    });

    describe("when receiver's address is normal wallet", async () => {
      it("should receive error message - Receiver transferAndCall must be contract", async () => {
        try {
          await SIRO.transferAndCall(OWNER, 100, web3.fromAscii("123"), {
            from: COMMUNITY_WALLET
          });
          assert(false, "Should not come here");
        } catch (err) {
          assert.include(
            err.message,
            "Receiver transferAndCall must be contract"
          );
        }
      });
    });

    describe("given MockedBookingReceiverFixedFee is ERC677Receiver & IFeeScheme", async () => {
      describe("given contract estimate fee is 5", async () => {
        describe("when sends 100", async () => {
          it("contract should receive 95", async () => {
            MOCKED_BOOKING_RECEIVER_FIXED_FEE = await MockedBookingReceiverFixedFee.new()

            let tx = await SIRO.transferAndCall(
              MOCKED_BOOKING_RECEIVER_FIXED_FEE.address,
              100,
              web3.fromAscii("123"),
              { from: CROWD_FUNDING_WALLET }
            );

            // assert transfer event of transferAndCall function
            let transfer = tx.logs[0].args;
            assert.equal(transfer.sender, CROWD_FUNDING_WALLET);
            assert.equal(transfer._to, MOCKED_BOOKING_RECEIVER_FIXED_FEE.address);
            assert.equal(transfer._amount.valueOf(), 95);
            assert.equal(transfer._data, web3.fromAscii("123"));

            // assert fee
            let fee = tx.logs[1].args;
            assert.equal(fee.from, CROWD_FUNDING_WALLET);
            assert.equal(fee.to, MOCKED_BOOKING_RECEIVER_FIXED_FEE.address);
            assert.equal(fee.issuer, OWNER);
            assert.equal(fee.value.valueOf(), 5);
          });
        });
      });
    });

    describe("given MockedBookingReceiverZeroFee is ERC677Receiver & IFeeScheme", async () => {
        describe("given contract estimate fee is 0", async () => {
          describe("when sends 100", async () => {
            it("contract should receive 100 and not receive Fee event", async () => {
              MOCKED_BOOKING_RECEIVER_ZERO_FEE = await MockedBookingReceiverZeroFee.new()
  
              let tx = await SIRO.transferAndCall(
                MOCKED_BOOKING_RECEIVER_ZERO_FEE.address,
                100,
                web3.fromAscii("123"),
                { from: CROWD_FUNDING_WALLET }
              );
  
              assert.equal(tx.logs.length, 1)
              // assert transfer event of transferAndCall function
              let transfer = tx.logs[0].args;
              assert.equal(transfer.sender, CROWD_FUNDING_WALLET);
              assert.equal(transfer._to, MOCKED_BOOKING_RECEIVER_ZERO_FEE.address);
              assert.equal(transfer._amount.valueOf(), 100);
              assert.equal(transfer._data, web3.fromAscii("123"));
            });
          });
        });
      });
  

  });
});
