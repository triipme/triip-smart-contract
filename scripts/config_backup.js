// 87,712,576

module.exports = {
    // Ethereum Network ID used to sign transactions
    // 1 - Main Net
    // 3 - Ropsten
    networkId: 4,

    // Private key of an account that will be used to distribute tokens
    // Always create a new account for token distribution.
    // Transfer only the amount of tokens that need to be distributed and some ETH for gas
    privateKey: '9C238738D326AF50B3E6E1F7970CAE24307243DFA73BE834104F6FC2797093E4',

    // Address of the token that will be distributed
    tokenAddress: '0x657fa33c186c23fda57c5caa2c41575827ce7ae7',

    // Specify how many decimal places the token has.
    // This is important! Setting this to an incorrect value could result in incorrect amounts sent.
    tokenSymbols: 18,

    // Gas price (in gwei) to use when transferring
    gasPrice: 20,

    // Gas limit
    gasLimit: 60000,

    token: '',

    apiUrl: 'http://localhost:8080/api' // Triip Chainnet
    
};