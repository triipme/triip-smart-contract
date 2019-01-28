pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract ERC677Receiver {
  function onTokenTransfer(address _sender, uint _value);
  function onTokenTransferWithUint(address _sender, uint _value, uint _enum_ordinal);
  function onTokenTransferWithByte(address _sender, uint _value, bytes _data);
}

contract TIIMToken is StandardToken, Ownable, Pausable {

    using SafeMath for uint;

    event Released(address indexed receiver, uint amount);
    event Burn(address indexed burner, uint value);

    mapping(address => uint) public bonusBalances;

    uint    public decimals = 18;
    string  public name = "TripMiles";
    string  public symbol = "TIIM";
    uint    public totalSupply = 500 * 10 ** 6 * TIIM_UNIT;                                 // 500,000,000 TIIM

    uint    public constant TIIM_UNIT = 10 ** 18;
    uint    public constant TIIMCommunityReserveAllocation = 125 * 10 ** 6 * TIIM_UNIT;     // 25% = 125,000,000 TIIM
    uint    public constant TIIMCrowdFundAllocation = 165 * 10 ** 6 * TIIM_UNIT;            // 33% = 165,000,000 TIIM
    uint    public constant TIIMEcoAllocation = 75 * 10 ** 6 * TIIM_UNIT;                   // 15% = 75,000,000 TIIM
    uint    public constant TIIMCompanyAllocation = 85 * 10 ** 6 * TIIM_UNIT;               // 17% = 85,000,000 TIIM
    uint    public constant TIIMTeamAllocation = 50 * 10 ** 6 * TIIM_UNIT;                  // 10% = 50,000,000 TIIM

    address public tiimCommunityReserveWallet;
    address public tiimCrowdFundAllocationWallet;
    address public tiimEcoWallet;
    address public tiimCompanyWallet;
    address public teamWallet;
    address public founderWallet;
    
    uint    public constant HOLDING_PERIOD = 180 days;
    
    bool    public stopped = false;

    uint    public startTime;
    uint    public endTime;

    // TIIM team allocation variables
    uint    public constant teamAllocation = 45 * 10 ** 6 * TIIM_UNIT;                      // allocate for team : 9% = 45,000,000 TIIM
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                    // release team tokens 12 tranches every 30 days period
    
    // TIIM founder allocation variables
    uint    public constant founderAllocation = 5 * 10 ** 6 * TIIM_UNIT;                    // allocate for founder : 1% = 5,000,000 TIIM
    
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                 // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    constructor(address _tiimCommunityReserveWallet, address _tiimCrowdFundAllocationWallet, address _tiimEcoWallet, address _tiimCompanyWallet) public {
        tiimCommunityReserveWallet = _tiimCommunityReserveWallet;
        tiimCrowdFundAllocationWallet = _tiimCrowdFundAllocationWallet;
        tiimEcoWallet = _tiimEcoWallet;
        tiimCompanyWallet = _tiimCompanyWallet;

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(TIIMCommunityReserveAllocation);
        balances[tiimCrowdFundAllocationWallet] = balances[tiimCrowdFundAllocationWallet].add(TIIMCrowdFundAllocation);
        balances[tiimEcoWallet] = balances[tiimEcoWallet].add(TIIMEcoAllocation);
        balances[tiimCompanyWallet] = balances[tiimCompanyWallet].add(TIIMCompanyAllocation);
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transferAndCall(address _to, uint _value) public returns (bool success)    {
        super.transfer(_to, _value);
        
        Transfer(msg.sender, _to, _value);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransfer(msg.sender, _value);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    * @param _data The extra data to be passed to the receiving contract.
    */
    function transferAndCallWithData(address _to, uint _value, bytes _data) public returns (bool success)    {
        super.transfer(_to, _value);
        
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithByte(msg.sender, _value, _data);
        }
        
        return true;
    }

    /**
    * @dev transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    * @param _enum_ordinal The enum ordinal function on receiving contract.
    */
    function transferAndCallWithUint(address _to, uint _value, uint _enum_ordinal) public returns (bool success)    {
        super.transfer(_to, _value);
        
        if (isContract(_to)) {
            
            ERC677Receiver receiver = ERC677Receiver(_to);
            
            receiver.onTokenTransferWithUint(msg.sender, _value, _enum_ordinal);
        }
        
        return true;
    }

    function isContract(address _addr) private returns (bool hasCode)  {
        uint length;
        assembly { length := extcodesize(_addr) }
        return length > 0;
    }


    /*
        @dev Bonus vesting condition
    */
    modifier afterHolding() {
        require(endTime > 0);

        uint validTime = endTime + HOLDING_PERIOD;

        require(now > validTime);

        _;
    }

    
    /*
        @dev start public ICO function
    */
    function startPublicIco() onlyOwner public {
        require(startTime == 0, "Start time must be not setup yet");
        startTime = now;
    }

    /*
        @dev end public ICO function
     */
    function endPublicIco() onlyOwner public {

        require(startTime > 0);
        require(endTime < startTime, "Start time must be setup already");
        require(endTime == 0, "End time must be not setup yet");
        
        endTime = now;
    }
    
    /**
        @dev Release TIIM Token to Team based on 12 tranches release every 30 days
        @return true if successful
    */
    function releaseTeamTokens() public returns (bool) {

        require(endTime > 0);
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

        require(endTime > 0);
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
    // Don't accept ETH
    // ------------------------------------------------------------------------
    function () public payable {
        revert();
    }
}