// "0xC66EE7780D78fDE56C30386F973daB8965a8165C", "0x98206bD174d8Aa995887d8499f8053f903FD0Aa8", "0xc788Ceae4EDC0F84FA86234df57a76181ae353a9"

const TriipInvestorsServices = artifacts.require("TriipInvestorsServices");

const {
  UNIT,
  TRANSFER_GAS,
  sendEth
} = require("../lib/utils");

const ONE_DAY = 60 * 60 * 24
let INSTALLMENT_FEE = 1 * UNIT

// contract('Init TriipInvestorsServices', (accounts) => {

//   let deployer = accounts[0];
//   let buyer = accounts[1];
//   let seller = accounts[2];
//   let buyerWallet = accounts[3];
//   let investorService;
  
//   beforeEach("Triip investors services init", async () => {

//     investorService = await TriipInvestorsServices.new(buyer, seller, buyerWallet);

//     await investorService.setPaymentAmount(INSTALLMENT_FEE);
//   });
  
//   it('Init contract should have buyer, seller and buyerWallet', async () => {

//     const _buyer = await investorService.buyer()

//     const _seller = await investorService.seller()

//     const _buyerWallet = await investorService.buyerWallet()

//     assert.equal(_buyer, buyer)

//     assert.equal(_seller, seller)

//     assert.equal(_buyerWallet, buyerWallet)
//   });

//   it('When confirm purchase, contract should contain Installment Fee', async () => {

//     const txn = await investorService.confirmPurchase({from: deployer, value: INSTALLMENT_FEE })

//     const start = await investorService.startTime()

//     const end = await investorService.endTime()

//     const diff = (end - start) / ONE_DAY

//     const paidStage = await investorService.paidStage()

//     const balanceOfContract = await investorService.balance();

//     assert.equal(parseInt(balanceOfContract), INSTALLMENT_FEE, 'Balance of this contract should have 1 ETH')

//     assert.equal(diff, 45)

//     assert.equal(paidStage.valueOf(), 0)

//   });

// });

// contract('TriipInvestorsServices claim by KPI', (accounts) => {
//   let deployer = accounts[0];
//   let buyer = accounts[1];
//   let seller = accounts[2];
//   let buyerWallet = accounts[3];
//   let investorService;

//   beforeEach("Triip investors services init", async () => {

//     investorService = await TriipInvestorsServices.new(buyer, seller, buyerWallet)

//     await investorService.setPaymentAmount(INSTALLMENT_FEE)

//     await investorService.confirmPurchase( {from: deployer, value: INSTALLMENT_FEE })
    
//     // reset seller buyerWallet to 0

//     var buyerBalance = await web3.eth.getBalance(buyerWallet);

//     var balance = parseInt(buyerBalance);

//     if(balance > 0) {
//       await sendEth(buyerWallet, deployer, balance);
//     }

//     var sellerBalance = await web3.eth.getBalance(seller);

//     balance = parseInt(sellerBalance);

//     if(balance > 0) {
//       await sendEth(seller, deployer, balance);
//     }
//   });

//   it('Claim 4k before start one day should receive error message', async ()=> {

//     try {
      
//       await investorService.claimFirstInstallment();

//       assert(false, 'Should not come here');

//     } catch (err) {
//       assert.include(err.message, 'revert Require first installment fee to be claimed after startTime + 1 day');
//     }
//   });

//   it('Claim 4k after start one day should receive 40% of installment fee', async ()=> {

//     const startTime = await investorService.startTime();

//     await investorService.setStartTime( parseInt(startTime) - 172800 );

//     const txn =   await investorService.claimFirstInstallment();

//     const eventPayoff = txn.logs[0].args;

//     assert.equal(eventPayoff['_seller'], seller, "Receive 40% installment fee should be Seller");
//     assert.equal(eventPayoff['_amount'], 0.4 * UNIT, "Seller should receive 40% fee");
//     assert.equal(eventPayoff['_kpi'], 0, "KPI should be 0k");

//     var sellerBalance = await web3.eth.getBalance(seller);

//     assert.equal(sellerBalance , INSTALLMENT_FEE * 0.4, 'seller wallet should receive 40% installment fee');

//     // teardown
//     await web3.eth.sendTransaction({from: seller, to: accounts[9], value: INSTALLMENT_FEE * 0.4 - 21000 * 1000, gasPrice:1000, gas: 21000})
//   });

//   it('Claim when seller reach 100k KPI should end contract and seller should receive their installment fee', async () => {

//     // mock: send 10 ETH to buyerWallet to reach 100k KPI
//     await web3.eth.sendTransaction({from: accounts[9], to: buyerWallet, value: INSTALLMENT_FEE * 10})

//     var sellerBalance = await web3.eth.getBalance(seller);

//     // await printBuyerAndTargetAmount(investorService);

//     const txn = await investorService.claim()

//     const claimEvent = txn.logs[0]
//     const payoffEvent = txn.logs[1]
    
//     assert.equal(payoffEvent.args['_kpi'], 100)

//     assert.equal(
//       parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()), 
//       INSTALLMENT_FEE * 10, 
//       'Buyer Wallet should have equal or greater than 100k KPI goal');

//     const isEnd = await investorService.isEnd()

//     assert.isTrue(isEnd, 'this contract should end')

//     sellerBalance = await web3.eth.getBalance(seller);
    
//     assert.equal(sellerBalance, INSTALLMENT_FEE, 'seller should receive 1ETH');

//     // teardown
//     await web3.eth.sendTransaction({from: buyerWallet, to: accounts[9], value: INSTALLMENT_FEE * 10 - 21000 * 1000, gasPrice:1000, gas: 21000})
//     await web3.eth.sendTransaction({from: seller, to: deployer, value: INSTALLMENT_FEE - 21000 * 1000, gasPrice:1000, gas: 21000})

//   })

//   it('Claim when seller reach 25k KPI should receive 33/100 installment fee', async () => {

//     // mock : send 3 ETH to buyerWallet to reach 25k KPI
//     await web3.eth.sendTransaction({from: accounts[8], to: buyerWallet, value: 3 * UNIT})

//     const startTime = await investorService.startTime();

//     // await printBuyerAndTargetAmount(investorService);

//     await investorService.setStartTime( parseInt(startTime) - 16 * 24 * 60 * 60 );

//     const txn = await investorService.claim()

//     const claimEvent = txn.logs[0]
//     const payoffEvent = txn.logs[1]

//     assert.equal(parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()) , 3 * UNIT);

//     assert.equal(parseInt(payoffEvent.args['_kpi']), 25, "Should be 25k KPI");

//     // teardown
//     await web3.eth.sendTransaction({from: buyerWallet, to: accounts[8], value: 3 * UNIT - 21000 * 1000, gasPrice:1000, gas: 21000})
//     await web3.eth.sendTransaction({from: seller, to: deployer, value: INSTALLMENT_FEE * 33 / 100 - 21000 * 1000, gasPrice:1000, gas: 21000})

//   })

//   it('Claim when seller reach 50k KPI should receive 66/100 installment fee', async () => {

//     // mock : send 6 ETH to buyerWallet to reach 25k KPI
//     await web3.eth.sendTransaction({from: accounts[8], to: buyerWallet, value: 6 * UNIT})

//     const startTime = await investorService.startTime();

//     await investorService.setStartTime( parseInt(startTime) - 31 * 24 * 60 * 60 );

//     // await printBuyerAndTargetAmount(investorService);

//     // 50%
//     const txn = await investorService.claim()

//     const claimEvent = txn.logs[0]
//     const payoffEvent = txn.logs[1]

//     assert.equal(parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()) , 6 * UNIT);

//     assert.equal(parseInt(payoffEvent.args['_kpi']), 50, "Should be 50k KPI");

//     // teardown
//     await web3.eth.sendTransaction({from: buyerWallet, to: accounts[8], value: 6 * UNIT - 21000 * 1000, gasPrice:1000, gas: 21000})
//     await web3.eth.sendTransaction({from: seller, to: deployer, value: INSTALLMENT_FEE * 66 / 100 - 21000 * 1000, gasPrice:1000, gas: 21000})

//   });

//   it('Claim when seller reach 60k KPI in 20 days should receive 33/100 installment fee', async () => {

//     // mock : send 6 ETH to buyerWallet to reach 25k KPI
//     await web3.eth.sendTransaction({from: accounts[8], to: buyerWallet, value: 6 * UNIT})

//     const startTime = await investorService.startTime();

//     const day20th = 20 * 24 * 60 * 60;
//     await investorService.setStartTime( parseInt(startTime) - day20th );

//     // 33%
//     const txn = await investorService.claim()

//     const claimEvent = txn.logs[0]
//     const payoffEvent = txn.logs[1]

//     assert.equal(parseInt(claimEvent.args['_buyerWalletBalance'].valueOf()) , 6 * UNIT);

//     assert.equal(parseInt(payoffEvent.args['_amount'])/UNIT , 0.33, 'Seller should receive 33% of current balance');

//     assert.equal(parseInt(payoffEvent.args['_kpi']), 25, "Should be 25k KPI");

//     // teardown
//     await web3.eth.sendTransaction({from: buyerWallet, to: accounts[8], value: 6 * UNIT - 21000 * 1000, gasPrice:1000, gas: 21000})
//     await web3.eth.sendTransaction({from: seller, to: deployer, value: INSTALLMENT_FEE * 33 / 100 - 21000 * 1000, gasPrice:1000, gas: 21000})

//   });

//   it('Refund remaining balance', async() => {
    
//   });

// })

printBuyerAndTargetAmount = async (investorService) => {
  
  const targetSellingAmount = await investorService.targetSellingAmount();

  console.log('targetSellingAmount : ', parseInt(targetSellingAmount)/UNIT);

  const buyerWalletBalance = await investorService.buyerWalletBalance();

  console.log('buyerWalletBalance : ', parseInt(buyerWalletBalance)/UNIT);
}
