// 87,712,576

module.exports = {
    // Ethereum Network ID used to sign transactions
    // 1 - Main Net
    // 3 - Ropsten
    // 89 - Tomo Testnet
    // 88 - Tomo Mainnet
    networkId: 88,

    // network: 'rinkeby',
    network: 'TOMO_MAINNET',

    // networkRpc: 'https://rinkeby.infura.io/v3/710034254fa54f4cb22c151aeb0b398e',
    networkRpc: 'https://rpc.tomochain.com',

    // Private key of an account that will be used to distribute tokens
    // Always create a new account for token distribution.
    // Transfer only the amount of tokens that need to be distributed and some ETH for gas
    privateKey: '6359965C51AC0D941AC11D541BD9E953025AE408C80DD9DDB301F84318AED261',
    // Address of the token that will be distributed
    tokenAddress: '0x9e2b6a4b95a02afa43e59963c062b8daa07dc20a',

    // Specify how many decimal places the token has.
    // This is important! Setting this to an incorrect value could result in incorrect amounts sent.
    tokenSymbols: 18,

    // Gas price (in kwei) to use when transferring
    // gasPrice: 20,
    gasPrice: 1,

    // Gas limit
    gasLimit: 60000,

    token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0cmlpcF9iYWNrZW5kIiwiYXV0aCI6IlJPTEVfQURNSU4iLCJleHAiOjQ2OTgzOTA3NjZ9.T9CjshMMFHMDzBmWVn-KhrXdO9ske9cVz8TGuV0o1NfnTNB1gqucZqT8Znkj2_3UEb_3Tb5tsV4ht4oM3eaH0A',

    apiUrl: 'http://localhost:8080/api' // Triip Chainnet
    // apiUrl: 'http://178.128.216.90:8080/api' // Triip Chainnet
};