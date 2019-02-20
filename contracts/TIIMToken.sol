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
    event Burn(address indexed burner, uint value);
    event Transfer(address indexed sender, address indexed _to, uint _amount, bytes _data);
    event Transfer(address indexed sender, address indexed _to, uint _amount, uint _enum_ordinal);
    event Buy(address indexed _contributor, uint _tiim_sold);

    mapping(address => uint) public bonusBalances;

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
    
    bool    public stopped = false;

    uint    public startTime;
    uint    public endTime = 1554051599;                                                    // March 31, 2019 11:59:59 PM GMT+07:00

    // TIIM team allocation & holding variables
    uint    public constant teamAllocation = 45 * MILLION_TIIM_UNIT;                 // allocate for team : 9% = 45,000,000 TIIM
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                    // release team tokens 12 tranches every 30 days period
    
    // TIIM founder allocation & holding variables
    uint    public constant founderAllocation = 5 * MILLION_TIIM_UNIT;               // allocate for founder : 1% = 5,000,000 TIIM
    
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                 // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    uint    public constant conversionRate = 40;                                            // 1 TOMO = 40 TIIM
    uint    public constant minimumContribute = 10;                                         // contribute amount has to be equal or greater than 10 TOMO


    constructor(address _tiimCommunityReserveWallet, 
                address _tiimCrowdFundAllocationWallet, 
                address _tiimEcoWallet, 
                address _tiimCompanyWallet,
                address _teamWallet,
                address _founderWallet) public {
                    
        tiimCommunityReserveWallet = _tiimCommunityReserveWallet;
        tiimCrowdFundAllocationWallet = _tiimCrowdFundAllocationWallet;
        tiimEcoWallet = _tiimEcoWallet;
        tiimCompanyWallet = _tiimCompanyWallet;
        teamWallet = _teamWallet;
        founderWallet = _founderWallet;

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(TIIMCommunityReserveAllocation);
        balances[tiimCrowdFundAllocationWallet] = balances[tiimCrowdFundAllocationWallet].add(TIIMCrowdFundAllocation);
        balances[tiimEcoWallet] = balances[tiimEcoWallet].add(TIIMEcoAllocation);
        balances[tiimCompanyWallet] = balances[tiimCompanyWallet].add(TIIMCompanyAllocation);
        balances[this] = TIIMCrowdFundTomoAllocation;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _amount The amount to be transferred.
    */
    function transferAndCall(address _to, uint _amount) public returns (bool success)    {
        super.transfer(_to, _amount);
        
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
    function transferAndCallWithData(address _to, uint _amount, bytes _data) public returns (bool success)    {
        super.transfer(_to, _amount);
        
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
    function transferAndCallWithUint(address _to, uint _amount, uint _enum_ordinal) public returns (bool success)    {
        
        super.transfer(_to, _amount);

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
        require(startTime == 0, "Start time must be not setup yet");
        startTime = now;
        
    }

    modifier afterEndIco() {
        require(now >= endTime, "Should be after End ICO");
        _;
    }
    
    /**
        @dev Release TIIM Token to Team based on 12 tranches release every 30 days
        @return true if successful
    */
    function releaseTeamTokens() public returns (bool) {

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
    function releaseFounderTokens() public returns (bool) {

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

    function publicIcoRemainingToken() public view returns (uint) {
        return ERC20(this).balanceOf(this);
    }

    function processBuy() public payable whenNotPaused {

        require(remainingToken > 0, "We have not enough Token for this purchase");
        
        require(_contributor != address(0x0));
        
        require(_amount >= (minimumContribute * 1 ether), "We only accept minimum purchase of 10 TOMO");
        
        require(!isContract(_contributor), "We do not allow buyer from contract");

        address _contributor = msg.sender;
        uint _amount = msg.value;
        
        uint tokenAmount = _amount.mul(conversionRate);

        uint remainingToken = publicIcoRemainingToken();

        if( tokenAmount > remainingToken ) {

            // partial sale
            tokenAmount = remainingToken;
            
            uint refundAmount = _amount.sub(remainingToken.div(conversionRate));

            _amount = _amount - refundAmount;
            
            _contributor.transfer(refundAmount);
        }

        // send TIIM to contributor address
        ERC20(this).transfer(_contributor, tokenAmount);

        // send TOMO to Triip crowd funding wallet
        tiimCrowdFundAllocationWallet.transfer(_amount);
            
        emit Buy(_contributor, tokenAmount);
    }

    function refundRemainingTokenToPatron() public afterEndIco returns (bool) {
        
        uint remainingToken = balanceOf(this);

        ERC20(this).transfer(tiimCommunityReserveWallet, remainingToken);

        return true;
    }
}