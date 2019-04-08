// 87,712,576

module.exports = {
    // Ethereum Network ID used to sign transactions
    // 1 - Main Net
    // 3 - Ropsten
    // 89 - Tomo Testnet
    // 88 - Tomo Mainnet
    networkId: 89,

    // network: 'rinkeby',
    network: 'TOMO_TESTNET',

    // networkRpc: 'https://rinkeby.infura.io/v3/710034254fa54f4cb22c151aeb0b398e',
    networkRpc: 'https://testnet.tomochain.com',

    // Private key of an account that will be used to distribute tokens
    // Always create a new account for token distribution.
    // Transfer only the amount of tokens that need to be distributed and some ETH for gas
    privateKey: '293659D6B9AEE4C3F4AC48592735626D88C6CFFD761ACCBF8725CF9DB3EE501D',
    // Address of the token that will be distributed
    tokenAddress: '0xe688f97edb7801136df4a8f49c720ce5aea0771d',

    // Specify how many decimal places the token has.
    // This is important! Setting this to an incorrect value could result in incorrect amounts sent.
    tokenSymbols: 18,

    // Gas price (in kwei) to use when transferring
    // gasPrice: 20,
    gasPrice: 20,

    // Gas limit
    gasLimit: 60000,

    token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0cmlpcF9iYWNrZW5kIiwiYXV0aCI6IlJPTEVfQURNSU4iLCJleHAiOjQ2OTgzOTA3NjZ9.T9CjshMMFHMDzBmWVn-KhrXdO9ske9cVz8TGuV0o1NfnTNB1gqucZqT8Znkj2_3UEb_3Tb5tsV4ht4oM3eaH0A',

    apiUrl: 'http://localhost:8080/api' // Triip Chainnet
    // apiUrl: 'http://178.128.216.90:8080/api' // Triip Chainnet
};