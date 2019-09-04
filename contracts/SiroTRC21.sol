pragma solidity ^0.4.25;

import "./FeeScheme.sol";
import "./BytesUtils.sol";

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
    paused = false;
    emit Unpause();
  }
}
/**
 * @title ITRC21
 * @dev TRC21 interface
 * See https://github.com/tomochain/trc21/blob/master/contracts/TRC21.sol#L66
 */
contract ITRC21 {

  function issuer() public view returns (address);

  function estimateFee(uint value) public view returns (uint);

  function totalSupply() public view returns (uint);
  
  function balanceOf(address _who) public view returns (uint);
  
  function transfer(address _to, uint _value) public returns (bool);

  function allowance(address _owner, address _spender) public view returns (uint);

  function transferFrom(address _from, address _to, uint _value) public returns (bool);

  function approve(address _spender, uint _value) public returns (bool);
  
  event Approval(address indexed owner, address indexed spender, uint value);
  
  event Transfer(address indexed from, address indexed to, uint value);
  
  event Fee(address indexed from, address indexed to, address indexed issuer, uint value);
}

contract ERC677Receiver {
  function onTokenTransfer(address from, uint256 amount, bytes data) returns (bool success);
}

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract TRC21 is ITRC21 {

  using SafeMath for uint;

  mapping(address => uint) internal balances;
  mapping(address => mapping (address => uint)) internal allowed;

  uint private _fee;
  address private _issuer;

  uint internal totalSupply_;
    
    /**
     * @dev Estimate transaction fee.
     * @param value amount tokens sent
     */
    function estimateFee(uint value) public view returns (uint256) {
        return value.mul(0).add(_fee);
    }

  /**
     * @dev Transfers token's foundation to new issuer
     * @param _newIssuer The address to transfer ownership to.
     */
    function _changeIssuer(address _newIssuer) internal {
        require(_newIssuer != address(0));
        _issuer = _newIssuer;
    }

    /**
     * @dev Change fee
     * @param value fee
     */
    function _changeFee(uint value) internal {
        _fee = value;
    }

    function issuer() public view returns (address){
        return _issuer;
    }

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint) {
    return totalSupply_;
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) public returns (bool) {
    
    require(_value <= balances[msg.sender], "Balance of sender should greater than or equals with sending amount");
    require(_to != address(0), "Receiver address must not be Zero");

    uint _transferFee = estimateFee(_value);
    uint _amountReceived = _value.sub(_transferFee);

    _transfer(msg.sender, _to, _amountReceived);
    emit Transfer(msg.sender, _to, _amountReceived);
    
    if (_transferFee > 0) {
        _transfer(msg.sender, _issuer, _transferFee);
        emit Fee(msg.sender, _to, _issuer, _transferFee);
    }
    
    return true;
  }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal {
        require(value <= balances[from]);
        require(to != address(0));
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
    }  

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint) {
    return balances[_owner];
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amount of tokens to be transferred
   */
  function transferFrom(address _from,address _to,uint _value) public returns (bool) {
    
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_to != address(0));

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner,address _spender) public view returns (uint) {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(address _spender,uint _addedValue) public returns (bool) {
      
      allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
      emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
      return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
      uint oldValue = allowed[msg.sender][_spender];
      if (_subtractedValue >= oldValue) {
        allowed[msg.sender][_spender] = 0;
      } else {
        allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
      }
      emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
      return true;
  }
}

contract SIROToken is TRC21, Ownable, Pausable, BytesUtils {

    using SafeMath for uint;

    event Released(address indexed receiver, uint amount);
    event Transfer(address indexed sender, address indexed _to, uint _amount, bytes _data);
    event Buy(address indexed _contributor, uint _SIRO_sold);
    event Refund(address indexed _patron_wallet, uint _SIRO_remaining_token);
    event IssuerTransferred(address indexed _issuer, address indexed _new_issuer);

    uint    public decimals = 18;
    string  public name = "SiroSmile";
    string  public symbol = "SIRO";
    uint    public totalSupply = 500 * MILLION_SIRO_UNIT;                                        // 500,000,000 SIRO

    uint    public constant DECIMALS_UNIT = 18;
    uint    public constant SIRO_UNIT = 10 ** DECIMALS_UNIT;
    uint    public constant MILLION_SIRO_UNIT = 10 ** 6 * SIRO_UNIT;

    uint    public constant SIROCommunityReserveAllocation = 125 * MILLION_SIRO_UNIT;            // 125,000,000 SIRO
    uint    public constant SIROCrowdFundAllocation = 75 * MILLION_SIRO_UNIT;                    // 75,000,000 SIRO - private sale & other currency
    uint    public constant SIROEcoAllocation = 75 * MILLION_SIRO_UNIT;                          // 75,000,000 SIRO
    uint    public constant SIROCompanyAllocation = 85 * MILLION_SIRO_UNIT;                      // 85,000,000 SIRO
    uint    public constant SIROTeamAllocation = 50 * MILLION_SIRO_UNIT;                         // 50,000,000 SIRO

    uint    public constant SIROCrowdFundTomoAllocation = 90 * MILLION_SIRO_UNIT;                // 90,000,000 SIRO

    address public SIROCommunityReserveWallet;
    address public SIROCrowdFundAllocationWallet;
    address public SIROEcoWallet;
    address public SIROCompanyWallet;
    address public teamWallet;
    address public founderWallet;
    address public SIROCrowdFundTomoAllocationWallet;

    uint    public startTime = 1550854800;                                                      // February 23, 2019 0:00:00 GMT+07:00
    uint    public endTime = 1554051599;                                                        // March 31, 2019 23:59:59 GMT+07:00

    // SIRO team allocation & holding variables
    uint    public constant teamAllocation = 45 * MILLION_SIRO_UNIT;                            // allocate for team : 9% = 45,000,000 SIRO
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                        // release team tokens 12 tranches every 30 days period
    
    // SIRO founder allocation & holding variables
    uint    public constant founderAllocation = 5 * MILLION_SIRO_UNIT;                          // allocate for founder : 1% = 5,000,000 SIRO
    
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                     // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    uint    public constant conversionRate = 40;                                            // 1 TOMO = 40 SIRO
    uint    public constant minimumContribute = 10;                                         // contribute amount has to be equal or greater than 10 TOMO

    IFeeScheme public feeScheme;

    function setEndTimeForTesting(uint _endTime) public onlyOwner returns (bool) {
      endTime = _endTime;
      return true;
    }

    constructor(address _SIROCommunityReserveWallet, 
                address _SIROCrowdFundAllocationWallet, 
                address _SIROEcoWallet, 
                address _SIROCompanyWallet,
                address _teamWallet,
                address _founderWallet,
                address _SIROCrowdFundTomoAllocationWallet,
                address _feeScheme
                ) public {

        require(_feeScheme != address(0), "Fee scheme address must not be address of Zero");
                    
        SIROCommunityReserveWallet = _SIROCommunityReserveWallet;
        SIROCrowdFundAllocationWallet = _SIROCrowdFundAllocationWallet;
        SIROEcoWallet = _SIROEcoWallet;
        SIROCompanyWallet = _SIROCompanyWallet;
        teamWallet = _teamWallet;
        founderWallet = _founderWallet;
        SIROCrowdFundTomoAllocationWallet = _SIROCrowdFundTomoAllocationWallet;

        balances[SIROCommunityReserveWallet] = balances[SIROCommunityReserveWallet].add(SIROCommunityReserveAllocation);
        balances[SIROCrowdFundAllocationWallet] = balances[SIROCrowdFundAllocationWallet].add(SIROCrowdFundAllocation);
        balances[SIROEcoWallet] = balances[SIROEcoWallet].add(SIROEcoAllocation);
        balances[SIROCompanyWallet] = balances[SIROCompanyWallet].add(SIROCompanyAllocation);
        balances[SIROCrowdFundTomoAllocationWallet] = balances[SIROCrowdFundTomoAllocationWallet].add(SIROCrowdFundTomoAllocation);

        _changeIssuer(msg.sender);
        feeScheme = IFeeScheme(_feeScheme);

        pause();
    }

    function changeIssuer(address _newIssuer) onlyOwner public returns(bool) {
        require(_newIssuer != address(0), "New issuer address must not be address of Zero");

        emit IssuerTransferred(issuer(), _newIssuer);
        
        _changeIssuer(_newIssuer);
        
        return true;
    }

    function setFeeScheme(address _newFeeScheme) onlyOwner public {
        feeScheme = IFeeScheme(_newFeeScheme);
    }

    function estimateFee(uint _value) public view returns (uint) {
        return feeScheme.estimateFee(_value);
    }

    /**
     * @dev ERC677 combine with TRC21
     * contract receive transferAndCall must be ERC677Receiver & IFeeScheme
     */
    function estimateContractFee(address _contract, uint _value) public view returns (uint) {
        
        return IFeeScheme(_contract).estimateFee(_value);
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
    * @dev ERC677 transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    * @param _data The extra data to be passed to the receiving contract.
    */
    function transferAndCall(address _to, uint _value, bytes _data) public whenNotPaused returns (bool success) {
      
        require(_value <= balances[msg.sender], "Balance of sender must be greater than or equals with sending amount");
        require(_to != address(0), "Contract receiver's address should not be Zero");
        require (isContract(_to), "Receiver transferAndCall must be contract");

        uint _transferFee = estimateContractFee(_to, _value);
        uint _amountReceived = _value.sub(_transferFee);
        
        _transfer(msg.sender, _to, _amountReceived);
        emit Transfer(msg.sender, _to, _amountReceived, _data);

        if (_transferFee > 0) {
            _transfer(msg.sender, issuer(), _transferFee);
            emit Fee(msg.sender, _to, issuer(), _transferFee);
        }

        contractFallback(_to, _value, _data);

        return true;
    }
    
    function contractFallback(address _to, uint _value, bytes _data) private {
      ERC677Receiver receiver = ERC677Receiver(_to);
      receiver.onTokenTransfer(msg.sender, _value, _data);
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
        @dev Release SIRO Token to Team based on 12 tranches release every 30 days
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
        @dev Release SIRO Token to Founder based on 24 tranches release every 30 days
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

        // subtract SIRO from SIROCrowdFundTomoAllocationWallet
        balances[SIROCrowdFundTomoAllocationWallet] = balances[SIROCrowdFundTomoAllocationWallet].sub(tokenAmount);
        // send SIRO to contributor address
        balances[_contributor] = balances[_contributor].add(tokenAmount);

        // send TOMO to Siro crowd funding wallet
        SIROCrowdFundAllocationWallet.transfer(_amount);

        emit Transfer(SIROCrowdFundTomoAllocationWallet, _contributor, tokenAmount);
        emit Buy(_contributor, tokenAmount);
    }

    function publicIcoRemainingToken() public view returns (uint) {
        return balanceOf(SIROCrowdFundTomoAllocationWallet);
    }

    function refundRemainingTokenToPatron() public afterEndIco returns (bool) {
        
        uint remainingToken = publicIcoRemainingToken();

        balances[SIROCrowdFundTomoAllocationWallet] = balances[SIROCrowdFundTomoAllocationWallet].sub(remainingToken);

        balances[SIROCommunityReserveWallet] = balances[SIROCommunityReserveWallet].add(remainingToken);

        emit Transfer(SIROCrowdFundTomoAllocationWallet, SIROCommunityReserveWallet, remainingToken);

        emit Refund(SIROCommunityReserveWallet, remainingToken);

        return true;
    }
}
