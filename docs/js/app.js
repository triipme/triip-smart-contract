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
      
      
      let TIIMCommunityReserveAllocation = await tokenTIIMCommunityReserveAllocation();
      let TIIMCrowdFundAllocation = await tokenTIIMCrowdFundAllocation();

      let TIIMEcoAllocation = await tokenTIIMEcoAllocation();
      let TIIMCompanyAllocation = await tokenTIIMCompanyAllocation();
      let TIIMTeamAllocation = await tokenTIIMTeamAllocation();


      let tokenBalance = await getTokenBalance(account);

      let balance = await getBalance(account);

      $("#Wallet").text(account);
      $("#Balance").text(web3.utils.fromWei(balance, "ether"));
      $("#TokenBalance").text(tokenBalance);
      $("#TokenName").text(name);

      $("#TIIMCommunityReserveAllocation").text(web3.utils.fromWei(TIIMCommunityReserveAllocation));
      $("#TIIMCrowdFundAllocation").text(web3.utils.fromWei(TIIMCrowdFundAllocation));
      $("#TIIMEcoAllocation").text(web3.utils.fromWei(TIIMEcoAllocation));
      $("#TIIMCompanyAllocation").text(web3.utils.fromWei(TIIMCompanyAllocation));
      $("#TIIMTeamAllocation").text(web3.utils.fromWei(TIIMTeamAllocation));

      $("#Login").css("display", "inline");
    }
  }
}


web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.tomochain.com"));

// TIIM Token smart contract address at Tomo Mainnet
var contract_address = "0x4f7239c38d73a6cba675a3023cf84b304f6daef6";

// Instance TIIM Token contract
var token = new web3.eth.Contract(contract_abi, contract_address);

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

async function tokenTIIMCommunityReserveAllocation() {
  let TIIMCommunityReserveAllocation = await token.methods.TIIMCommunityReserveAllocation().call();
  return TIIMCommunityReserveAllocation;
}

async function tokenTIIMCrowdFundAllocation() {
  let TIIMCrowdFundAllocation = await token.methods.TIIMTokenSaleAllocation().call();
  return TIIMCrowdFundAllocation;
}

async function tokenTIIMEcoAllocation() {
  let TIIMEcoAllocation = await token.methods.TIIMEcosystemAllocation().call();
  return TIIMEcoAllocation;
}

async function tokenTIIMCompanyAllocation() {
  let TIIMCompanyAllocation = await token.methods.TIIMCompanyReserveAllocation().call();
  return TIIMCompanyAllocation;
}

async function tokenTIIMTeamAllocation() {
  let TIIMTeamAllocation = await token.methods.totalTeamAllocated().call();
  return TIIMTeamAllocation;
}

async function getAccount() {
  let accounts = await web3.eth.getAccounts();
  return accounts[0];
}

TIIMCommunityReserveAllocation = async()=> {
  let allocation = await token.methods.TIIMCommunityReserveAllocation().call();
  return allocation;
}