const FixedFeeSchemeContract = artifacts.require('FixedFeeScheme')
const PercentageFeeSchemeContract = artifacts.require('PercentageFeeScheme')

let FixedFeeScheme
let PercentageFeeScheme

let anonymous

contract('FixedFeeScheme', accounts => {

    beforeEach('init', async () => {
        FixedFeeScheme = await FixedFeeSchemeContract.new()
        anonymous = accounts[1]
    })

    describe('#estimateFee', () => {

        describe('when does not set minFee', async() => {
            it('returns estimated fee should be 0.01 = 10^16', async () => {
                const fixedFee = await FixedFeeScheme.estimateFee(0)
                assert.equal(fixedFee, 10 ** 16)
            })
        })
        
        describe('when set minFee is 1 = 10^18', async() => {
            it('returns estimated fee should be 1 = 10^18', async()=> {
                await FixedFeeScheme.setFee(10**18)
    
                const fixedFee = await FixedFeeScheme.estimateFee(0)
                assert.equal(fixedFee, 10**18)
            })
        })
    })

    describe('#setFee', () =>{
        describe('when not owner try to change min fee', async () => {
            it('should throw exception', async() =>{
                try {
                    await FixedFeeScheme.setFee(10**18, {from: anonymous})
                    assert(false, "Should not come here")
                } catch(err){
                    assert.include(err.message, "revert")
                }
            })
        })
    })
})


contract('PercentageFeeScheme', accounts => {

    beforeEach('init', async () => {
        PercentageFeeScheme = await PercentageFeeSchemeContract.new()
    })

    describe('#estimateFee', () => {

        describe('when does not set percentage', async() => {
            it('returns estimated fee should be 1% of transfer value', async () => {
                const fixedFee = await PercentageFeeScheme.estimateFee(100)
                assert.equal(fixedFee.valueOf(), 1)
            })
        })
        
        describe('when set percentage is 5', async() => {
            
            beforeEach('set 5%', async () => {
                await PercentageFeeScheme.setFee(5)
            })

            it('returns estimated fee should be 5% of transfer value', async()=> {
                const fixedFee = await PercentageFeeScheme.estimateFee(100)
                assert.equal(fixedFee.valueOf(), 5)
            })

            describe('when value is 1', async() => {
                it('returns estimated fee is 0', async() =>{
                    const fixedFee = await PercentageFeeScheme.estimateFee(1)
                    assert.equal(fixedFee.valueOf(), 0)
                })
            })
        })
    })
})