pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract Receiver {
  function onTokenTransfer(address _sender, uint _amount) public;
  function onTokenTransferWithUint(address _sender, uint _amount, uint _value) public;
  function onTokenTransferWithByte(address _sender, uint _amount, bytes _data) public;
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
    
    mapping(address => uint) internal staking_map;

    address[] public staking_lists;

    WaitingInfo[] public waiting_lists;

    mapping(address => WithdrawalInfo[]) internal withdrawal_map;

    PatronSetting settings;

    function setPatronSetting(address _settings) public onlyOwner returns (bool) {
        settings = PatronSetting(_settings);
        emit ModifiedPatronSetting(_settings);
        return true;
    }

    struct WithdrawalInfo {
        uint amount;
        uint withdrawal_at;
    }

    struct WaitingInfo {
        address investor;
        uint amount;
        uint staked_at;
    }

    /**
    * @dev Gets the stacking amount of the specified address.
    * @param _patron The address to query.
    * @return An uint representing the amount owned by the passed address.
    */
    function getStackingAmount(address _patron) public view returns (uint) {
        return staking_map[_patron];
    }

    function onTokenTransfer(address _sender, uint _amount) public onlyTIIMToken {
        stake(_sender, _amount);
    }

    function onTokenTransferWithUint(address _sender, uint _amount, uint _value) public onlyTIIMToken { 
        stake(_sender, _amount);
    }
    function onTokenTransferWithByte(address _sender, uint _amount, bytes _data) public onlyTIIMToken {
        stake(_sender, _amount);
    }

    function stake(address _patron, uint _amount) private returns (bool) {
        
        staking_map[_patron] = staking_map[_patron].add(_amount);

        return true;
    }

    function unstake(uint _amount) public returns (bool) {
        
        require(_amount >= settings.minimum_unstake_amount(), "Unstake must be over minimum unstake amount");

        uint patron_staking_amount = staking_map[msg.sender];

        require(patron_staking_amount >= _amount,"Patron balance should be greater or equals with unstake amount");

        staking_map[msg.sender] = staking_map[msg.sender].sub(_amount);

        withdrawal_map[msg.sender].push(WithdrawalInfo(_amount, now) );

        emit Unstake(msg.sender, _amount, now);

        return true;

    }

    function withdrawal(uint _index) public returns (bool) {
        
        require(withdrawal_map[msg.sender].length > 0 , "Should have withdrawal pending");

        uint _withdrawal_at = withdrawal_map[msg.sender][_index].withdrawal_at;

        require(now >= _withdrawal_at + settings.withdrawal_delay_in_seconds(), "Still in withdrawal delay");

        uint _amount = withdrawal_map[msg.sender][_index].amount;

        tiim_token.transfer(msg.sender, _amount);

        return true;

    }
}