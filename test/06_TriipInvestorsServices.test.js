const TriipInvestorsServices = artifacts.require("TriipInvestorsServices");

const DECIMALS = 18
const UNIT = 10 ** DECIMALS
const MILLION = 10 ** 6
const TOTAL_SUPPLY = 500 * MILLION * UNIT
const ONE_DAY = 60 * 60 * 24

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

  it('Confirm purchase - ', async () => {

    // send 99 ether from accounts 9 to deployer
    await web3.eth.sendTransaction({from: accounts[9], to: deployer, value: 99 * UNIT})

    await investorService.confirmPurchase({from: deployer, value: 82 * UNIT })

    const start = await investorService.start()

    const end = await investorService.end()

    const diff = (end - start) / ONE_DAY

    assert.equal(diff, 45)

    // const contractBalance = await investorService.contractEthBalance()

    // const buyerWalletBalance = await investorService.buyerWalletBalance()

  });

  it('Claim', async () => {
    
        // send 99 ether from accounts 8 to deployer
        await web3.eth.sendTransaction({from: accounts[8], to: deployer, value: 99 * UNIT})
    // await web3.eth.sendTransaction({from: buyerWallet, to: deployer, value: 99.999 * UNIT})

    // var buyerWalletBalance = await web3.eth.getBalance(buyerWallet)

    // console.log('buyerWalletBalance : ', buyerWalletBalance)

    await investorService.confirmPurchase( {from: deployer, value: 82 * UNIT })

    const txn1 = await investorService.claim()

    // console.log('Claim : ' , txn1.logs[2].args['_amount'].valueOf() )
    // console.log('Claim : ' , txn1.logs[2].args['_condition'].valueOf() )

    //const txn2 = await investorService.claim()

    //console.log('Claim : ' , txn2.logs[0].args)

  })

  it('Reach KPI & Claim', async () => {

    var balanceBuyerWallet;
    
    balanceBuyerWallet = web3.eth.getBalance(buyerWallet)

    // console.log(balanceBuyerWallet)

    await web3.eth.sendTransaction({from: deployer, to: buyerWallet, value : 1 * UNIT})

    balanceBuyerWallet = web3.eth.getBalance(buyerWallet)

    // console.log(balanceBuyerWallet)

    const txn1 = await investorService.claim()

    // console.log('Claim : ' , txn1)

    // console.log('Claim : ' , txn1.logs[0])
    // console.log('Claim : ' , txn1.logs[1])
    // console.log('Claim : ' , txn1.logs[2])

  })
  
});