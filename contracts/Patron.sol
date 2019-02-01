pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract AbstractPatron is Ownable {

    event ModifiedPatron(address indexed patron_address);
    event ModifiedTiimToken(address indexed tiim_token);
    

    Patron public patron;
    ERC20 public tiim_token;

    function setTiimToken(address _tiim_token) onlyOwner public returns (bool) {
        
        require(isContract(_tiim_token), 'TIIM Token must be a contract');
        
        tiim_token = ERC20(_tiim_token);

        uint balance = tiim_token.balanceOf(this);

        require(balance == 0, 'TIIM Token should have balanceOf method and its balance should be zero when setting TIIM token');
        
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
        patron = Patron(_patron);
        emit ModifiedPatron(_patron);
        return true;
    }
}

contract RewardPatron is AbstractPatron {

    event ModifiedFrequenceInSeconds(uint frequence_in_seconds);
    event ModifiedFrequenceRewardAmount(uint frequence_reward_amount);
    event ModifiedWithdrawalDelayInSeconds(uint withdrawal_delay_in_seconds);

    
    uint public frequence_in_seconds;
    uint public frequence_reward_amount;
    uint public withdraw_delay_in_seconds;
    uint public minimum_staking_amount;

    modifier onlyPatron() {
        require(patron != address(0), 'Patron contract should be set already');
        require(msg.sender == address(patron), 'Sender must be a patron contract' );
        _;
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

    function setWithdrawalDelayInSeconds(uint _withdraw_delay_in_seconds) onlyOwner public returns (bool) {
        withdraw_delay_in_seconds = _withdraw_delay_in_seconds;
        emit ModifiedWithdrawalDelayInSeconds(_withdraw_delay_in_seconds);
        return true;
    }

    function setMinimumStakingAmount(uint _minimum_staking_amount) onlyOwner public returns (bool) {
        minimum_staking_amount = _minimum_staking_amount;
        return true;
    }

    function claimReward(address _investor, uint _amount) onlyPatron public returns (bool) {
        tiim_token.transfer(_investor, _amount);
        return true;
    }
}

contract StakingPatron is AbstractPatron {
    
    uint public total_staking_amount;
    mapping(address => uint256) internal staking_map;
    address[] public staking_lists;
    WaitingInfo[] public waiting_lists;
    mapping(address => WithdrawalInfo) withdrawal_map;

    struct WithdrawalInfo {
        uint amount;
        uint withdrawal_at;
    }

    struct WaitingInfo {
        address investor;
        uint amount;
        uint staked_at;
    }
}

contract Patron is Ownable , Pausable {

    RewardPatron public reward_patron;

    function setRewardPatron(address _reward_patron) public {
        reward_patron = RewardPatron(_reward_patron);
    }

    function testClaim(address _investor, uint _amount) public {
        reward_patron.claimReward(_investor, _amount);
    }
}