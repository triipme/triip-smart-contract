pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract TripVerifier is Ownable {
    event AddedVerifier(address indexed verifier);
    event RemovedVerifier(address indexed verifier);
    
    mapping(address => bool) public verifiers;
    
    function addVerifier(address _verifier) onlyOwner public {
        verifiers[_verifier] = true;
        emit AddedVerifier(_verifier);
    }
    
    function removeVerifier(address _verifier) onlyOwner public {
        verifiers[_verifier] = false;
        emit RemovedVerifier(_verifier);
    }
    
    function isVerifier(address _verifier) public view returns(bool) {
        return verifiers[_verifier];
    }
    
}