const SIROToken = artifacts.require('SIROToken')
const PercentageFeeSchemeContract = artifacts.require('PercentageFeeScheme')


const {
    MILLION,
    UNIT
  } = require('../lib/utils');

  
let SIRO

let COMMUNITY_WALLET
let CROWD_FUNDING_WALLET
let ECO_WALLET
let COMPANY_WALLET
let TEAM_WALLET
let FOUNDER_WALLET
let TOMO_ALLOCATION_WALLET
let PERCENTAGE_FEE_SCHEME


contract('SIROToken', accounts => {
  
  beforeEach('SIRO Token init', async () => {
    
    COMMUNITY_WALLET = accounts[0]
    CROWD_FUNDING_WALLET = accounts[1]
    ECO_WALLET = accounts[2]
    COMPANY_WALLET = accounts[3]
    TEAM_WALLET = accounts[4]
    FOUNDER_WALLET = accounts[5]
    TOMO_ALLOCATION_WALLET = accounts[6]

    PERCENTAGE_FEE_SCHEME = await PercentageFeeSchemeContract.new()

    SIRO = await SIROToken.new(
      COMMUNITY_WALLET, 
      CROWD_FUNDING_WALLET, 
      ECO_WALLET, 
      COMPANY_WALLET, 
      TEAM_WALLET, 
      FOUNDER_WALLET,
      TOMO_ALLOCATION_WALLET,
      PERCENTAGE_FEE_SCHEME.address
      )

    SIRO.unpause()
  })

  describe('#transfer', async()=>{
    
    it('sends value - fee for receiver', async () => {
        let tx = await SIRO.transfer(FOUNDER_WALLET, 100 * MILLION, {from: CROWD_FUNDING_WALLET});
        console.log("TX: ", tx)
        console.log("TX: ", tx.logs[1])
    })

    it('sends fee for issuer', async () => {

    })

    describe('when blance > value', async()=>{
      
    })

    describe('when to is address 0', async()=>{
      
    })

    describe('when fee > value', async()=>{
      
    })

    describe('when fee is 0', async()=>{
      
    })
  })

  describe('#transferAndCall', async() => {
      
  })
})  