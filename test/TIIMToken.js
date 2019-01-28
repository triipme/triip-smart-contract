const TIIMToken = artifacts.require("TIIMToken");

const DECIMALS = 18
const UNIT = 10 ** DECIMALS
const MILLION = 10 ** 6
const TOTAL_SUPPLY = 500 * MILLION * UNIT

contract('TIIMToken', (accounts) => {
  
  it('Total supply should be 500_000_000', async () => {
    
    const instance = await TIIMToken.deployed()
    
    const totalSupply = await instance.totalSupply()

    assert.equal(totalSupply.valueOf(), TOTAL_SUPPLY, "500_000_000 is total supply")

  });
  
});