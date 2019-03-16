pragma solidity ^0.4.25;

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: openzeppelin-solidity/contracts/lifecycle/Pausable.sol

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

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * See https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address _who) public view returns (uint256);
  function transfer(address _to, uint256 _value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

// File: openzeppelin-solidity/contracts/token/ERC20/ERC20.sol

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address _owner, address _spender)
    public view returns (uint256);

  function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool);

  function approve(address _spender, uint256 _value) public returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

// File: contracts/Patron.sol

contract Receiver {
  function onTokenTransfer(address _patron, uint _amount) public;
  function onTokenTransferWithUint(address _patron, uint _amount, uint _value) public;
  function onTokenTransferWithByte(address _patron, uint _amount, bytes _data) public;
}

contract AbstractPatron is Ownable {

    event ModifiedPatron(address indexed patron_address);
    event ModifiedTiimToken(address indexed tiim_token);
    
    using SafeMath for uint;

    Patron public patron;
    ERC20 public tiim_token;

    modifier onlyPatron() {
        require(patron != address(0), 'Patron contract should be set already');
        require(msg.sender == address(patron), 'Sender must be a patron contract' );
        _;
    }

    modifier onlyTIIMToken() {
        require(tiim_token != address(0), 'TIIM Token contract should be set already');
        require(msg.sender == address(tiim_token), 'Sender must be a TIIM Token contract' );
        _;
    }

    function setTiimToken(address _tiim_token) onlyOwner public returns (bool) {
        
        require(isContract(_tiim_token), 'TIIM Token must be a contract');
        
        tiim_token = ERC20(_tiim_token);
        
        emit ModifiedTiimToken(_tiim_token);
        
        return true;
    }

    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    function setPatron(address _patron) onlyOwner public returns (bool) {
        require(_patron != address(0x0));
        patron = Patron(_patron);
        emit ModifiedPatron(_patron);
        return true;
    }
}

contract PatronSetting is AbstractPatron {

    event ModifiedFrequenceInSeconds(uint frequence_in_seconds);
    event ModifiedFrequenceRewardAmount(uint frequence_reward_amount);
    event ModifiedWithdrawalDelayInSeconds(uint withdrawal_delay_in_seconds);

    
    uint public frequence_in_seconds;
    uint public frequence_reward_amount;
    uint public withdrawal_delay_in_seconds;
    uint public minimum_stake_amount;
    uint public minimum_unstake_amount;

    function setFrequenceInSeconds(uint _frequence_in_seconds) onlyOwner public returns (bool) {
        frequence_in_seconds = _frequence_in_seconds;
        emit ModifiedFrequenceInSeconds(_frequence_in_seconds);
        return true;
    }

    function setFrequenceRewardAmount(uint _frequence_reward_amount) onlyOwner public returns (bool) {
        frequence_reward_amount = _frequence_reward_amount;
        emit ModifiedFrequenceRewardAmount(_frequence_reward_amount);
        return true;
    }

    function setWithdrawalDelayInSeconds(uint _withdrawal_delay_in_seconds) onlyOwner public returns (bool) {
        withdrawal_delay_in_seconds = _withdrawal_delay_in_seconds;
        emit ModifiedWithdrawalDelayInSeconds(_withdrawal_delay_in_seconds);
        return true;
    }
    
    function setMinimumStakeAmount(uint _minimum_stake_amount) onlyOwner public returns (bool) {
        minimum_stake_amount = _minimum_stake_amount;
        return true;
    }

    function setMinimumUnstakeAmount(uint _minimum_unstake_amount) onlyOwner public returns (bool) {
        minimum_unstake_amount = _minimum_unstake_amount;
        return true;
    }

    function claimReward(address _investor, uint _amount) onlyPatron public returns (bool) {
        tiim_token.transfer(_investor, _amount);
        return true;
    }
}

contract Patron is AbstractPatron, Receiver {

    event ModifiedPatronSetting(address indexed _patron_settings);
    event Unstake(address indexed _patron, uint _amount, uint _withdrawal_at);
    
    uint public total_staking_amount;

    address[] public staking_list;
    
    mapping(address => uint) internal staking_map;
    mapping(address => WithdrawalInfo[]) internal withdrawal_map;

    PatronStaking public patron_staking;
    PatronSetting public patron_setting;

    struct WithdrawalInfo {
        uint amount;
        uint withdrawal_at;
    }

    modifier onlyPatronStaking () {
        require(msg.sender == address(patron_staking), "Should call from Patron Staking");
        _;
    }

    function setPatronStaking(address _patron_staking) public onlyOwner {
        patron_staking = PatronStaking(_patron_staking);
    }

    /**
    * @dev Gets the stacking amount of the specified address.
    * @param _patron The address to query.
    * @return An uint representing the amount owned by the passed address.
    */
    function getStackingAmount(address _patron) public view returns (uint) {
        return staking_map[_patron];
    }

    
    function stake(address _patron, uint _amount) public onlyPatronStaking returns (bool) {
        
        if(staking_map[_patron] == 0) {
            // new patron
            staking_list.push(_patron);
        }

        staking_map[_patron] = staking_map[_patron] + _amount;

        total_staking_amount = total_staking_amount + _amount;

        return true;
    }

    function unstake(uint _amount) public returns (bool) {
        
        require(_amount >= patron_setting.minimum_unstake_amount(), "Unstake must be over minimum unstake amount");

        uint patron_staking_amount = staking_map[msg.sender];

        require(patron_staking_amount >= _amount,"Patron balance should be greater or equals with unstake amount");

        staking_map[msg.sender] = staking_map[msg.sender] - _amount;

        withdrawal_map[msg.sender].push(WithdrawalInfo(_amount, now) );

        emit Unstake(msg.sender, _amount, now);

        total_staking_amount = total_staking_amount - _amount;

        return true;

    }

    function withdrawal(uint _index) public returns (bool) {
        
        require(withdrawal_map[msg.sender].length > 0 , "Should have withdrawal pending");

        uint _withdrawal_at = withdrawal_map[msg.sender][_index].withdrawal_at;

        require(now >= _withdrawal_at + patron_setting.withdrawal_delay_in_seconds(), "Still in withdrawal delay");

        uint _amount = withdrawal_map[msg.sender][_index].amount;

        tiim_token.transfer(msg.sender, _amount);

        return true;

    }

    function dispatch_reward() public onlyPatronStaking {
        // calc reward : reward_per_token:  = reward / total staking tiim;
        uint rewardPerToken = patron_setting.frequence_reward_amount() / total_staking_amount;
        
        // send reward : list investor & staked amount
        for(uint i = 0 ; i < staking_list.length; i++) {
            
            address patronAddress = staking_list[i];
            uint patronReward = staking_map[patronAddress] * rewardPerToken;
            tiim_token.transfer(patronAddress, patronReward);

        }  
    }
}

contract PatronStaking is AbstractPatron, Receiver {

    Patron public patron;
    PatronSetting public patron_setting;
    ERC20 public tiim_token;

    uint public lastTriggerPatronRewardAt;
    uint public epoch = 0;

    WaitingInfo[] public waiting_list;

    struct WaitingInfo {
        address patron;
        uint amount;
        uint staked_at;
    }

    constructor (address _patron, address _patron_setting, address _tiim_token) public {
        patron = Patron(_patron);
        patron_setting = PatronSetting(_patron_setting);
        tiim_token = ERC20(_tiim_token);
    }

    function start() public onlyOwner {
        lastTriggerPatronRewardAt = now + patron_setting.frequence_in_seconds();
    }


    function onTokenTransfer(address _patron, uint _amount) public onlyTIIMToken {

        staking(_patron, _amount);
        
    }

    function staking(address _patron, uint _amount) private {

        uint minimum = patron_setting.minimum_stake_amount();

        require(_amount >= minimum, "Must equals or greater than minimum staking amount");

        tiim_token.transfer(patron, _amount);

        waiting_list.push(WaitingInfo(_patron, _amount, now ));

    }

    function onTokenTransferWithUint(address _patron, uint _amount, uint _value) public onlyTIIMToken { 
        
    }
    function onTokenTransferWithByte(address _patron, uint _amount, bytes _data) public onlyTIIMToken {
        
    }

    /**
     * 1. move from waiting list to staking list
     * 2. dispatch reward
     */
    function triggerPatronReward() public {
        
        require(now > lastTriggerPatronRewardAt);

        // cover miss epoch
        uint rewardTimes = ( now - lastTriggerPatronRewardAt ) / patron_setting.frequence_in_seconds();

        for(uint i = 0 ; i < rewardTimes ; i++) {

            // move from waiting list to staking list
            // calculate reward
            // dispatch reward

            uint rewardAt = lastTriggerPatronRewardAt + patron_setting.frequence_in_seconds();
            
            moveToStaking(rewardAt);

            patron.dispatch_reward();

            lastTriggerPatronRewardAt = rewardAt;

            epoch = epoch + 1;
        }
    }

    function moveToStaking(uint rewardAt) private {
        
        for (uint i = 0 ; i < waiting_list.length; i++) {
            
            WaitingInfo storage waitingInfo = waiting_list[i];
            
            uint staked_at = waitingInfo.staked_at;
            if(staked_at <= rewardAt){
                patron.stake(waitingInfo.patron, waitingInfo.amount);
            }
        }
    }
}
