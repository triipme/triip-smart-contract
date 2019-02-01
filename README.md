# THE TRIIP PLEDGE

A deep love of the environment and a recognition of the need to take strong, immediate action to protect is at the heart of everything we do. By partnering with us, you’re joining us in our mission to meaningful solutions to the the growing ecological crisis.It means a lot to us, so we’re offering all who sign the Triip Pledge an amount of token. You’re already doing a lot by reading this white paper, so please accept this gift as our show of thanks.

On top of that, we’re contributing 1% of each booking conducted on Triip to a Sustainable Fund that we’re using to advance a series of sustainability projects, including plastic waste reduction program SaveYourOcean.com. We’re a blockchain and travel company, but we’re also much more than that. Similarly, you’re more than just a traveler and a consumer. You’re an important part of the change we all need to make together to chart a different course for the Earth and all those who share our home.

# Contents

 1. [Technical Stack](#technical-stack)
 2. [Setup](#setup)
 3. [Testing](#testing)
 4. [Deploy](#deploy)

# Technical Stack

* nvm 0.33.11
* node v8.11.2
* npm 6.1.0
* Truffle v4.1.15

# Setup
* `npm i -g truffle@4.1.15`
* `yarn install`


# Testing
* `truffle develop` => go to truffle console
* `test` => run all test
* `test test/TIIMToken.js` => run specific test file

# Deploy
* `MNEMONIC="{your seed word}" truffle migrate --network rinkeby --reset` : you need MNEMONIC to deploy to Rinkeby - note: wallet from your seed word must have ETH for deploying