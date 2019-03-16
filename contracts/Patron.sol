pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


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

    StakingInfo[] public staking_lists;
    
    mapping(address => uint) internal staking_map;
    mapping(address => WithdrawalInfo[]) internal withdrawal_map;

    struct WithdrawalInfo {
        uint amount;
        uint withdrawal_at;
    }

    struct StakingInfo {
        address patron;
        uint amount;
    }

    /**
    * @dev Gets the stacking amount of the specified address.
    * @param _patron The address to query.
    * @return An uint representing the amount owned by the passed address.
    */
    function getStackingAmount(address _patron) public view returns (uint) {
        return staking_map[_patron];
    }

    
    function stake(address _patron, uint _amount) private returns (bool) {
        
        waiting_lists.push(WaitingInfo(_patron, _amount, now));

        return true;
    }

    function updateWaitingList() public onlyPatronStaking returns (bool) {

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

contract PatronStaking is Receiver, Ownable {

    Patron public patron;
    PatronSetting public patron_setting;
    ERC20 public tiim_token;

    uint public lastTriggerPatronRewardAt;

    WaitingInfo[] public waiting_list;

    struct WaitingInfo {
        address patron;
        uint amount;
        uint staked_at;
    }

    constructor (address _patron, address _patron_setting, address _tiim_token) public {
        patron = Patron(_patron);
        patron_setting = PatronSetting(_patron_setting);
        tiim_token = TIIMToken(_tiim_token);
    }

    function start() onlyOwner {
        lastTriggerPatronRewardAt = now + patron_setting.frequence_in_seconds();
    }


    function onTokenTransfer(address _patron, uint _amount) public onlyTIIMToken {

        staking(_patron, _amount);
        
    }

    function staking(address _patron, uint _amount) private {

        uint minimum = patron_setting.minimum_stake_amount();

        require(_amount >= minimum, "Must equals or greater than minimum staking amount");

        tiim_token.transfer(patron, _amount);

        waiting_lists.push(WaitingInfo(_patron, _amount, now ));

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

            reward();

            lastTriggerPatronRewardAt = rewardAt;
        }
    }

    function reward() {
        // calc reward : reward_per_token:  = reward / total staking tiim;
        uint rewardPerToken = patron_setting.frequence_reward_amount() / patron.total_staking_amount();
        // send reward : list investor & staked amount
        StakingInfo[] stakings = patron.staking_lists();

        for(uint i = 0 ; i < stakings.length; i++) {
            
            uint patronReward = stakings[i].amount * rewardPerToken;

            tiim_token.transfer(stakings[i].patron, patronReward);

        }

    }

    function moveToStaking(uint rewardAt) {
        
        for (uint i = 0 ; i < waiting_list.length; i++) {
            
            WaitingInfo waitingInfo = waiting_list[i];
            
            uint staked_at = waitingInfo.staked_at;
            if(staked_at <= rewardAt){
                patron.stake(waitingInfo.patron, waitingInfo.amount);
            }
        }
    }
}