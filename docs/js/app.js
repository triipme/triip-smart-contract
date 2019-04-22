// Connect to blockchain network via Web3

// Connect to TOMO MainNet only
var web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.tomochain.com"));

// TIIM Token smart contract address at Tomo Mainnet
var contract_address = "0x4f7239c38d73a6cba675a3023cf84b304f6daef6";

// Instance TIIM Token contract
var token = new web3.eth.Contract(contract_abi, contract_address);

// Detect MetaMask on init and update UI accordingly
async function initPage() {
  if (typeof web3 === "undefined") {
    console.log("No Web3 Detected, cannot connect to mainnet");
    $("#needlogin, #contractData").hide();
  } else {
    console.log("Web3 Detected! Current Provider: ", web3.currentProvider.host);
    $("#mmguide").hide();

    account = await getAccount();
    if (account === undefined) {
      $("#needlogin, #contractData").show();
    } else {
      // Basic labels
      $("#ContractAddress").html("<a href='https://scan.tomochain.com/tokens/" + contract_address + "' target='_blank'>" + contract_address + "</a>");
      // Show spinner UI
      $(".async-value-holder").append($("#spinner").clone().removeClass('d-none'));
      // Fetch data
      fetchContractData();
    }
  }
}

async function fetchContractData() {
  let account = await getAccount();
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
}


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