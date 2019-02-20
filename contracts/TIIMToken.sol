pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract ERC677Receiver {
  function onTokenTransfer(address _sender, uint _amount) public;
  function onTokenTransferWithUint(address _sender, uint _amount, uint _enum_ordinal) public;
  function onTokenTransferWithByte(address _sender, uint _amount, bytes _data) public;
}

contract TIIMToken is StandardToken, Ownable, Pausable {

    using SafeMath for uint;

    event Released(address indexed receiver, uint amount);
    event Transfer(address indexed sender, address indexed _to, uint _amount, bytes _data);
    event Transfer(address indexed sender, address indexed _to, uint _amount, uint _enum_ordinal);
    event Buy(address indexed _contributor, uint _tiim_sold);
    event Refund(address indexed _patron_wallet, uint _tiim_remaining_token);

    uint    public decimals = 18;
    string  public name = "TriipMiles";
    string  public symbol = "TIIM";
    uint    public totalSupply = 500 * MILLION_TIIM_UNIT;                                        // 500,000,000 TIIM

    uint    public constant DECIMALS_UNIT = 18;
    uint    public constant TIIM_UNIT = 10 ** DECIMALS_UNIT;
    uint    public constant MILLION_TIIM_UNIT = 10 ** 6 * TIIM_UNIT;

    uint    public constant TIIMCommunityReserveAllocation = 125 * MILLION_TIIM_UNIT;            // 125,000,000 TIIM
    uint    public constant TIIMCrowdFundAllocation = 75 * MILLION_TIIM_UNIT;                    // 75,000,000 TIIM - private sale & other currency
    uint    public constant TIIMEcoAllocation = 75 * MILLION_TIIM_UNIT;                          // 75,000,000 TIIM
    uint    public constant TIIMCompanyAllocation = 85 * MILLION_TIIM_UNIT;                      // 85,000,000 TIIM
    uint    public constant TIIMTeamAllocation = 50 * MILLION_TIIM_UNIT;                         // 50,000,000 TIIM

    uint    public constant TIIMCrowdFundTomoAllocation = 90 * MILLION_TIIM_UNIT;                // 90,000,000 TIIM

    address public tiimCommunityReserveWallet;
    address public tiimCrowdFundAllocationWallet;
    address public tiimEcoWallet;
    address public tiimCompanyWallet;
    address public teamWallet;
    address public founderWallet;
    address public tiimCrowdFundTomoAllocationWallet;

    uint    public startTime = 1550854800;                                                      // February 23, 2019 0:00:00 GMT+07:00
    uint    public endTime = 1554051599;                                                        // March 31, 2019 23:59:59 GMT+07:00

    // TIIM team allocation & holding variables
    uint    public constant teamAllocation = 45 * MILLION_TIIM_UNIT;                            // allocate for team : 9% = 45,000,000 TIIM
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                        // release team tokens 12 tranches every 30 days period
    
    // TIIM founder allocation & holding variables
    uint    public constant founderAllocation = 5 * MILLION_TIIM_UNIT;                          // allocate for founder : 1% = 5,000,000 TIIM
    
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                     // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    uint    public constant conversionRate = 40;                                            // 1 TOMO = 40 TIIM
    uint    public constant minimumContribute = 10;                                         // contribute amount has to be equal or greater than 10 TOMO

    constructor(address _tiimCommunityReserveWallet, 
                address _tiimCrowdFundAllocationWallet, 
                address _tiimEcoWallet, 
                address _tiimCompanyWallet,
                address _teamWallet,
                address _founderWallet,
                address _tiimCrowdFundTomoAllocationWallet) public {
                    
        tiimCommunityReserveWallet = _tiimCommunityReserveWallet;
        tiimCrowdFundAllocationWallet = _tiimCrowdFundAllocationWallet;
        tiimEcoWallet = _tiimEcoWallet;
        tiimCompanyWallet = _tiimCompanyWallet;
        teamWallet = _teamWallet;
        founderWallet = _founderWallet;
        tiimCrowdFundTomoAllocationWallet = _tiimCrowdFundTomoAllocationWallet;

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(TIIMCommunityReserveAllocation);
        balances[tiimCrowdFundAllocationWallet] = balances[tiimCrowdFundAllocationWallet].add(TIIMCrowdFundAllocation);
        balances[tiimEcoWallet] = balances[tiimEcoWallet].add(TIIMEcoAllocation);
        balances[tiimCompanyWallet] = balances[tiimCompanyWallet].add(TIIMCompanyAllocation);
        balances[tiimCrowdFundTomoAllocationWallet] = balances[tiimCrowdFundTomoAllocationWallet].add(TIIMCrowdFundTomoAllocation);

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
    * @param _amount The amount to be transferred.
    */
    function transfer(address _to, uint _amount) public whenNotPaused returns (bool) {
        super.transfer(_to, _amount);
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _amount The amount to be transferred.
    */
    function transferAndCall(address _to, uint _amount) public whenNotPaused returns (bool success)    {
        transfer(_to, _amount);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransfer(msg.sender, _amount);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _amount The amount to be transferred.
    * @param _data The extra data to be passed to the receiving contract.
    */
    function transferAndCallWithData(address _to, uint _amount, bytes _data) public whenNotPaused returns (bool success)    {
        transfer(_to, _amount);
        
        emit Transfer(msg.sender, _to, _amount, _data);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithByte(msg.sender, _amount, _data);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _amount The amount to be transferred.
    * @param _enum_ordinal The enum ordinal function on receiving contract.
    */
    function transferAndCallWithUint(address _to, uint _amount, uint _enum_ordinal) public whenNotPaused returns (bool success)    {
        
        transfer(_to, _amount);

        emit Transfer(msg.sender, _to, _amount, _enum_ordinal);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithUint(msg.sender, _amount, _enum_ordinal);
        }
        
        return true;
    }

    function isContract(address _addr) private view returns (bool hasCode)  {
        uint length;
        assembly { length := extcodesize(_addr) }
        return length > 0;
    }
    
    /*
        @dev start public ICO function
    */
    function startPublicIco() onlyOwner public {
        require(now >= startTime, "Start public ICO time should be after startTime");
        
        unpause();
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

        processBuy();

    }

    function processBuy() public payable whenNotPaused {

        address _contributor = msg.sender;
        uint _amount = msg.value;

        require(_contributor != address(0x0), "Must have contributor wallet address");
        
        require(_amount >= (minimumContribute * 1 ether), "We only accept minimum purchase of 10 TOMO");
        
        require(!isContract(_contributor), "We do not allow buyer from contract");

        uint remainingToken = publicIcoRemainingToken();
        
        require(remainingToken > 0, "We have not enough Token for this purchase");
        
        
        uint tokenAmount = _amount.mul(conversionRate);

        if( tokenAmount > remainingToken ) {

            // partial sale
            tokenAmount = remainingToken;
            
            uint refundAmount = _amount.sub(remainingToken.div(conversionRate));

            _amount = _amount - refundAmount;
            
            // refund remaining Tomo to contributor
            _contributor.transfer(refundAmount);
        }

        // subtract TIIM from tiimCrowdFundTomoAllocationWallet
        balances[tiimCrowdFundTomoAllocationWallet] = balances[tiimCrowdFundTomoAllocationWallet].sub(tokenAmount);
        // send TIIM to contributor address
        balances[_contributor] = balances[_contributor].add(tokenAmount);

        // send TOMO to Triip crowd funding wallet
        tiimCrowdFundAllocationWallet.transfer(_amount);

        emit Transfer(tiimCrowdFundTomoAllocationWallet, _contributor, tokenAmount);
        emit Buy(_contributor, tokenAmount);
    }

    function publicIcoRemainingToken() public view returns (uint) {
        return balanceOf(tiimCrowdFundTomoAllocationWallet);
    }

    function refundRemainingTokenToPatron() public afterEndIco returns (bool) {
        
        uint remainingToken = publicIcoRemainingToken();

        balances[tiimCrowdFundTomoAllocationWallet] = balances[tiimCrowdFundTomoAllocationWallet].sub(remainingToken);

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(remainingToken);

        emit Transfer(tiimCrowdFundTomoAllocationWallet, tiimCommunityReserveWallet, remainingToken);

        emit Refund(tiimCommunityReserveWallet, remainingToken);

        return true;
    }
}