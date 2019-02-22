pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract ERC677Receiver {
  function onTokenTransfer(address _sender, uint _purchase_amount) public;
  function onTokenTransferWithUint(address _sender, uint _purchase_amount, uint _enum_ordinal) public;
  function onTokenTransferWithByte(address _sender, uint _purchase_amount, bytes _data) public;
}

contract TIIMToken is StandardToken, Ownable, Pausable {

    using SafeMath for uint;

    event Released(address indexed receiver, uint amount);
    event Transfer(address indexed sender, address indexed _to, uint _purchase_amount, bytes _data);
    event Transfer(address indexed sender, address indexed _to, uint _purchase_amount, uint _enum_ordinal);
    event Buy(address indexed _purchaser, uint _tiim_sold);
    event Refund(address indexed _patron_wallet, uint _tiim_remaining_token);

    uint    public decimals = 18;
    string  public name = "TriipMiles";
    string  public symbol = "TIIM";
    uint    public totalSupply = 500 * MILLION_TIIM_UNIT;                                        // 500,000,000 TIIM

    uint    public constant DECIMALS_UNIT = 18;
    uint    public constant TIIM_UNIT = 10 ** DECIMALS_UNIT;
    uint    public constant MILLION_TIIM_UNIT = 10 ** 6 * TIIM_UNIT;

    uint    public constant TIIMCommunityReserveAllocation = 125 * MILLION_TIIM_UNIT;            // 125,000,000 TIIM
    
    uint    public constant TIIMTokenSaleAllocation = 75 * MILLION_TIIM_UNIT;                    // 75,000,000 TIIM - private sale & other currency
    uint    public constant TIIMTokenSaleTomoAllocation = 90 * MILLION_TIIM_UNIT;                // 90,000,000 TIIM
    
    uint    public constant TIIMEcosystemAllocation = 75 * MILLION_TIIM_UNIT;                    // 75,000,000 TIIM
    uint    public constant TIIMCompanyReserveAllocation = 85 * MILLION_TIIM_UNIT;               // 85,000,000 TIIM
    uint    public constant TIIMTeamAllocation = 50 * MILLION_TIIM_UNIT;                         // 50,000,000 TIIM
    
    address public tiimCommunityReserveWallet;
    address public tiimTokenSaleAllocationWallet;
    address public tiimEcosystemWallet;
    address public tiimCompanyReserveWallet;
    address public teamWallet;
    address public founderWallet;
    address public tiimTokenSaleTomoAllocationWallet;
    address public beneficiaryWallet;                                                           // TOMO receiver

    uint    public startTime = 1550854800;                                                      // February 23, 2019 0:00:00 GMT+07:00
    uint    public endTime = 1554051599;                                                        // March 31, 2019 23:59:59 GMT+07:00

    // TIIM team allocation & holding variables
    uint    public constant teamAllocation = 40 * MILLION_TIIM_UNIT;                            // allocate for team : 8% = 40,000,000 TIIM
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                        // release team tokens 12 tranches every 30 days period
    
    // TIIM founder allocation & holding variables
    uint    public constant founderAllocation = 10 * MILLION_TIIM_UNIT;                          // allocate for founder : 2% = 10,000,000 TIIM
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                     // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    uint    public constant conversionRate = 55;                                                // 1 TOMO = 55 TIIM
    uint    public constant minimumPurchase = 10;                                               // Purchase amount has to be equal or greater than 10 TOMO

    constructor(address _tiimCommunityReserveWallet, 
                address _tiimCrowdFundAllocationWallet, 
                address _tiimEcoWallet, 
                address _tiimCompanyReserveWallet,
                address _teamWallet,
                address _founderWallet,
                address _tiimTomoCrowdFundAllocationWallet,
                address _beneficiaryWallet) public {
                    
        tiimCommunityReserveWallet = _tiimCommunityReserveWallet;
        tiimTokenSaleAllocationWallet = _tiimCrowdFundAllocationWallet;
        tiimEcosystemWallet = _tiimEcoWallet;
        tiimCompanyReserveWallet = _tiimCompanyReserveWallet;
        teamWallet = _teamWallet;
        founderWallet = _founderWallet;
        tiimTokenSaleTomoAllocationWallet = _tiimTomoCrowdFundAllocationWallet;
        beneficiaryWallet = _beneficiaryWallet;

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(TIIMCommunityReserveAllocation);
        balances[tiimTokenSaleAllocationWallet] = balances[tiimTokenSaleAllocationWallet].add(TIIMTokenSaleAllocation);
        balances[tiimEcosystemWallet] = balances[tiimEcosystemWallet].add(TIIMEcosystemAllocation);
        balances[tiimCompanyReserveWallet] = balances[tiimCompanyReserveWallet].add(TIIMCompanyReserveAllocation);
        balances[tiimTokenSaleTomoAllocationWallet] = balances[tiimTokenSaleTomoAllocationWallet].add(TIIMTokenSaleTomoAllocation);

        pause();
    }

    /**
    * @dev ensure function call after endTime ICO
    */
    modifier afterEndIco() {
        require(now >= endTime, "Should be after End ICO");
        _;
    }

    /**
    * @dev Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _purchase_amount The amount to be transferred.
    */
    function transfer(address _to, uint _purchase_amount) public whenNotPaused returns (bool) {
        super.transfer(_to, _purchase_amount);
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _purchase_amount The amount to be transferred.
    */
    function transferAndCall(address _to, uint _purchase_amount) public whenNotPaused returns (bool success)    {
        transfer(_to, _purchase_amount);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransfer(msg.sender, _purchase_amount);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _purchase_amount The amount to be transferred.
    * @param _data The extra data to be passed to the receiving contract.
    */
    function transferAndCallWithData(address _to, uint _purchase_amount, bytes _data) public whenNotPaused returns (bool success)    {
        transfer(_to, _purchase_amount);
        
        emit Transfer(msg.sender, _to, _purchase_amount, _data);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithByte(msg.sender, _purchase_amount, _data);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _purchase_amount The amount to be transferred.
    * @param _enum_ordinal The enum ordinal function on receiving contract.
    */
    function transferAndCallWithUint(address _to, uint _purchase_amount, uint _enum_ordinal) public whenNotPaused returns (bool success)    {
        
        transfer(_to, _purchase_amount);

        emit Transfer(msg.sender, _to, _purchase_amount, _enum_ordinal);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithUint(msg.sender, _purchase_amount, _enum_ordinal);
        }
        
        return true;
    }

    function isContract(address _addr) private view returns (bool hasCode)  {
        uint length;
        assembly { length := extcodesize(_addr) }
        return length > 0;
    }

    function endPublicIco() onlyOwner afterEndIco public {
        require(now >= endTime, "Should be after end time ICO");
        // allow transfer
        unpause();
    }

    function refillTokenSaleTomo(uint _purchase_amount) public onlyOwner returns (bool) {
        

        return true;
    }
    
    /**
        @dev Release TIIM Token to Team based on 12 tranches release every 30 days
        @return true if successful
    */
    function releaseTeamTokens() public onlyOwner afterEndIco returns (bool) {

        require(teamWallet != 0x0);
        require(totalTeamAllocated < teamAllocation);
        require(teamTranchesReleased < maxTeamTranches);

        uint currentTranche = now.sub(endTime).div(RELEASE_PERIOD);

        if (teamTranchesReleased < maxTeamTranches && currentTranche > teamTranchesReleased) {

            uint amount = teamAllocation.div(maxTeamTranches);

            balances[teamWallet] = balances[teamWallet].add(amount);

            totalTeamAllocated = totalTeamAllocated.add(amount);

            teamTranchesReleased++;

            emit Transfer(0x0, teamWallet, amount);
            emit Released(teamWallet, amount);
        }
        return true;
    }

    /**
        @dev Release TIIM Token to Founder based on 24 tranches release every 30 days
        @return true if successful
    */
    function releaseFounderTokens() public onlyOwner afterEndIco returns (bool) {

        require(founderWallet != 0x0);
        require(totalFounderAllocated < founderAllocation);
        require(founderTranchesReleased < maxFounderTranches);

        uint currentTranche = now.sub(endTime).div(RELEASE_PERIOD);

        if (founderTranchesReleased < maxFounderTranches && currentTranche > founderTranchesReleased) {

            uint amount = founderAllocation.div(maxFounderTranches);

            balances[founderWallet] = balances[founderWallet].add(amount);

            totalFounderAllocated = totalFounderAllocated.add(amount);

            founderTranchesReleased++;

            emit Transfer(0x0, founderWallet, amount);
            emit Released(founderWallet, amount);
        }
        return true;
    }

    // ------------------------------------------------------------------------
    // Accept TOMO
    // ------------------------------------------------------------------------
    function () public payable  {

        processBuy(msg.sender, msg.value);

    }

    function processBuy(address _purchaser, uint _purchase_amount) private {

        require(_purchaser != address(0x0), "Must have purchaser wallet address");

        require(!isContract(_purchaser), "We do not allow purchaser from contract");
        
        require(_purchase_amount >= ( minimumPurchase.mul(1 ether) ), "We only accept minimum purchase is 10 TOMO");

        uint remainingToken = publicIcoRemainingToken();
        
        require(remainingToken > 0, "Our token sold out");
        
        uint tokenAmount = _purchase_amount.mul(conversionRate);

        if( tokenAmount > remainingToken ) {

            // partial sale
            tokenAmount = remainingToken;
            
            uint refundAmount = _purchase_amount.sub(remainingToken.div(conversionRate));

            _purchase_amount = _purchase_amount.sub(refundAmount);
            
            // refund remaining Tomo to purchaser
            _purchaser.transfer(refundAmount);
        }

        // subtract TIIM from tiimTokenSaleTomoAllocationWallet
        balances[tiimTokenSaleTomoAllocationWallet] = balances[tiimTokenSaleTomoAllocationWallet].sub(tokenAmount);

        // send TIIM to purchaser address
        balances[_purchaser] = balances[_purchaser].add(tokenAmount);

        // send TOMO to beneficiary wallet
        beneficiaryWallet.transfer(_purchase_amount);

        emit Transfer(tiimTokenSaleTomoAllocationWallet, _purchaser, tokenAmount);
        emit Buy(_purchaser, tokenAmount);
    }

    function publicIcoRemainingToken() public view returns (uint) {
        return balanceOf(tiimTokenSaleTomoAllocationWallet);
    }

    function refundRemainingTokenToPatron() public afterEndIco returns (bool) {
        
        uint remainingToken = publicIcoRemainingToken();

        balances[tiimTokenSaleTomoAllocationWallet] = balances[tiimTokenSaleTomoAllocationWallet].sub(remainingToken);

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(remainingToken);

        emit Transfer(tiimTokenSaleTomoAllocationWallet, tiimCommunityReserveWallet, remainingToken);

        emit Refund(tiimCommunityReserveWallet, remainingToken);

        return true;
    }
}