const TriipInvestorsServices = artifacts.require("TriipInvestorsServices");

const {
  UNIT,
  TRANSFER_GAS
} = require("../libs/constants");

const ONE_DAY = 60 * 60 * 24

// await web3.eth.sendTransaction({from: buyerWallet, to: deployer, value: 99.999 * UNIT})

contract('TriipInvestorsServices', (accounts) => {

  let deployer = accounts[0];
  let buyer = accounts[1];
  let seller = accounts[2];
  let buyerWallet = accounts[3];
  let investorService;
  
  beforeEach("Triip investors services init", async () => {

    investorService = await TriipInvestorsServices.new(buyer, seller, buyerWallet);
  });
  
  it('Init contract should have buyer, seller and buyerWallet', async () => {

    const _buyer = await investorService.buyer()

    const _seller = await investorService.seller()

    const _buyerWallet = await investorService.buyerWallet()

    assert.equal(_buyer, buyer)

    assert.equal(_seller, seller)

    assert.equal(_buyerWallet, buyerWallet)
  });

  it('When confirm purchase, contract should contain Installment Fee', async () => {

    await investorService.confirmPurchase({from: deployer, value: 10 * UNIT })

    const start = await investorService.start()

    const end = await investorService.end()

    const diff = (end - start) / ONE_DAY

    const paidStage = await investorService.paidStage()

    const balanceOfContract = await investorService.balance();

    assert.equal(parseInt(balanceOfContract), 10 * UNIT)

    assert.equal(diff, 45)

    assert.equal(paidStage.valueOf(), 0)

  });

});

contract('TriipInvestorsServices claim by KPI', (accounts) => {
  let deployer = accounts[0];
  let buyer = accounts[1];
  let seller = accounts[2];
  let buyerWallet = accounts[3];
  let investorService;

  beforeEach("Triip investors services init", async () => {

    investorService = await TriipInvestorsServices.new(buyer, seller, buyerWallet)

    await investorService.confirmPurchase( {from: deployer, value: 10 * UNIT })
    
  });

  it('Claim when seller reach 100k KPI should end contract and seller should receive their installment fee', async () => {

    // mock: send 20 ETH to buyerWallet to reach 100k KPI
    await web3.eth.sendTransaction({from: accounts[9], to: buyerWallet, value: 20 * UNIT})

    const txn = await investorService.claim()

    const claimEvent = txn.logs[0]
    const payoffEvent = txn.logs[1]
    
    assert.equal(payoffEvent.args['_kpi'], 100)

    assert.equal(parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()) , 20 * UNIT);

    const isEnd = await investorService.isEnd()

    assert.isTrue(isEnd, 'this contract should end')

    const sellerBalance = await web3.eth.getBalance(seller)

    assert.equal(sellerBalance - 100 * UNIT, 10 * UNIT, 'seller should receive 10ETH');

    // teardown
    await web3.eth.sendTransaction({from: buyerWallet, to: accounts[9], value: 20 * UNIT - TRANSFER_GAS})
    await web3.eth.sendTransaction({from: seller, to: accounts[9], value: 10 * UNIT - TRANSFER_GAS})

  })

  it('Claim when seller reach 25k KPI', async () => {

    // mock : send 5 ETH to buyerWallet to reach 25k KPI
    await web3.eth.sendTransaction({from: accounts[8], to: buyerWallet, value: 5 * UNIT})

    const buyerWalletBalance = await investorService.buyerWalletBalance()

    const txn = await investorService.claim()

    const claimEvent = txn.logs[0]
    const payoffEvent = txn.logs[1]

    assert.equal(parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()) , 5 * UNIT);
    assert.equal(parseInt(payoffEvent.args['_amount'],  ))

    // teardown
    await web3.eth.sendTransaction({from: buyerWallet, to: accounts[8], value: 5 * UNIT - TRANSFER_GAS})
    await web3.eth.sendTransaction({from: seller, to: accounts[9], value: 3.3 * UNIT - TRANSFER_GAS})

  })

})