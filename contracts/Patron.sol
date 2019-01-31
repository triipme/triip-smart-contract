pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract RewardPatron is Ownable {
    
    Patron public patron;
    
    uint public frequence_in_seconds;
    uint public frequence_reward_amount;
    uint public withdraw_delay_in_seconds;
    uint public minimum_staking_amount;

    function setPatron(address _patron) onlyOwner {
        patron = Patron(_patron);
    }

    function setFrequenceInSeconds(uint _frequence_in_seconds) onlyOwner {
        frequence_in_seconds = _frequence_in_seconds;
    }

    function setFrequenceRewardAmount(uint _frequence_reward_amount) onlyOwner {
        frequence_reward_amount = _frequence_reward_amount;
    }

    function setWithdrawalDelayInSeconds(uint _withdraw_delay_in_seconds) onlyOwner {
        withdraw_delay_in_seconds = _withdraw_delay_in_seconds;
    }

    function setMinimumStakingAmount(uint _minimum_staking_amount) public returns (bool) {
        minimum_staking_amount = _minimum_staking_amount;
        return true;
    }
}

contract StakingPatron is Ownable {
    
    Patron public patron;

    function setPatron(address _patron) {
        patron = Patron(_patron); 
    }
}

contract Patron is Ownable , Pausable {

}