const TriipInvestorsServices = artifacts.require("TriipInvestorsServices");

const DECIMALS = 18
const UNIT = 10 ** DECIMALS
const MILLION = 10 ** 6
const TOTAL_SUPPLY = 500 * MILLION * UNIT

contract('TriipInvestorsServices', (accounts) => {

  let deployer = accounts[0];
  let buyer = accounts[1];
  let seller = accounts[2];
  let buyerWallet = accounts[3];
  let investorService;
  
  beforeEach("Triip investors services init", async () => {

    investorService = await TriipInvestorsServices.deployed();
  });
  
  it('Init contract should have buyer, seller and buyerWallet', async () => {

    const _buyer = await investorService.buyer()

    const _seller = await investorService.seller()

    const _buyerWallet = await investorService.buyerWallet()

    assert.equal(_buyer, buyer)

    assert.equal(_seller, seller)

    assert.equal(_buyerWallet, buyerWallet)
  });

  it('Confirm purchase', async () => {
    await investorService.confirmPurchase({from: deployer, value: 1});
  })
  
});