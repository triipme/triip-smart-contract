pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./ERC677Receiver.sol";

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

    constructor (uint _frequence_in_seconds,
    uint _frequence_reward_amount,
    uint _withdrawal_delay_in_seconds,
    uint _minimum_stake_amount,
    uint _minimum_unstake_amount) public {
        
        frequence_in_seconds = _frequence_in_seconds;
        frequence_reward_amount = _frequence_reward_amount;
        withdrawal_delay_in_seconds = _withdrawal_delay_in_seconds;
        minimum_stake_amount = _minimum_stake_amount;
        minimum_unstake_amount = _minimum_unstake_amount;
    }

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

contract Patron is AbstractPatron {

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

contract PatronStaking is AbstractPatron, ERC677Receiver {

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

    function start() public onlyOwner {
        lastTriggerPatronRewardAt = now + patron_setting.frequence_in_seconds();
    }


    function onTokenTransfer(address _patron, uint _amount, bytes _data) public onlyTIIMToken returns (bool) {

        return staking(_patron, _amount, _data);
    }

    function staking(address _patron, uint _amount, bytes _data) private returns (bool) {

        uint minimum = patron_setting.minimum_stake_amount();

        require(_amount >= minimum, "Must equals or greater than minimum staking amount");

        tiim_token.transfer(patron, _amount);

        waiting_list.push(WaitingInfo(_patron, _amount, now ));

        return true;
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