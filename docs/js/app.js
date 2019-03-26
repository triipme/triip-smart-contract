async function loadEdit() {
  if (typeof web3 === "undefined") {
    console.log("No Web3 Detected... using HTTP Provider");
    window.web3 = new Web3(
      new Web3.providers.HttpProvider("https://rpc.tomochain.com")
    );
  } else {
    console.log("Web3 Detected! ", web3.currentProvider.constructor.name);

    window.web3 = new Web3(ethereum);

    let account = await getAccount();
    if (account === undefined) {
      $("#NotLogin").text("Please login Metamask");
    } else {
      let name = await tokenName();
      
      
      let SIROCommunityReserveAllocation = await tokenSIROCommunityReserveAllocation();
      let SIROCrowdFundAllocation = await tokenSIROCrowdFundAllocation();

      let SIROEcoAllocation = await tokenSIROEcoAllocation();
      let SIROCompanyAllocation = await tokenSIROCompanyAllocation();
      let SIROTeamAllocation = await tokenSIROTeamAllocation();


      let tokenBalance = await getTokenBalance(account);

      let balance = await getBalance(account);

      $("#Wallet").text(account);
      $("#Balance").text(web3.utils.fromWei(balance, "ether"));
      $("#TokenBalance").text(tokenBalance);
      $("#TokenName").text(name);

      $("#SIROCommunityReserveAllocation").text(web3.utils.fromWei(SIROCommunityReserveAllocation));
      $("#SIROCrowdFundAllocation").text(web3.utils.fromWei(SIROCrowdFundAllocation));
      $("#SIROEcoAllocation").text(web3.utils.fromWei(SIROEcoAllocation));
      $("#SIROCompanyAllocation").text(web3.utils.fromWei(SIROCompanyAllocation));
      $("#SIROTeamAllocation").text(web3.utils.fromWei(SIROTeamAllocation));

      $("#Login").css("display", "inline");
    }
  }
}


web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.tomochain.com"));

// Siro Token smart contract address at Tomo Mainnet
var contract_address = "0x9e2b6a4b95a02afa43e59963c062b8daa07dc20a";

// Instance Siro Token contract
var token = new web3.eth.Contract(contract_abi, contract_address, {from: "0x17f2E9B14dba1242e9444Fa2EAbA1986E9466248"});

async function getTokenBalance(account) {
  var balance = await token.methods.balanceOf(account).call();
  return web3.utils.fromWei(balance, 'ether');
}

async function getBalance(account) {
  let balance = await web3.eth.getBalance(account);
  return balance;
}

async function tokenName() {
  let name = await token.methods.name().call();
  return name;
}

async function tokenSIROCommunityReserveAllocation() {
  let siroCommunityReserveAllocation = await token.methods.SIROCommunityReserveAllocation().call();
  return siroCommunityReserveAllocation;
}

async function tokenSIROCrowdFundAllocation() {
  let SIROCrowdFundAllocation = await token.methods.SIROCrowdFundAllocation().call();
  return SIROCrowdFundAllocation;
}

async function tokenSIROEcoAllocation() {
  let SIROEcoAllocation = await token.methods.SIROEcoAllocation().call();
  return SIROEcoAllocation;
}

async function tokenSIROCompanyAllocation() {
  let SIROCompanyAllocation = await token.methods.SIROCompanyAllocation().call();
  return SIROCompanyAllocation;
}

async function tokenSIROTeamAllocation() {
  let SIROTeamAllocation = await token.methods.SIROTeamAllocation().call();
  return SIROTeamAllocation;
}

async function getAccount() {
  let accounts = await web3.eth.getAccounts();
  return accounts[0];
}

SIROCommunityReserveAllocation = async()=> {
  let allocation = await token.methods.SIROCommunityReserveAllocation().call();
  return allocation;
}