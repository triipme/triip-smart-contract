pragma solidity ^0.4.25;

contract TripVerifier {
    event AddedVerifier(address indexed verifier);
    event RemovedVerifier(address indexed verifier);
    
    mapping(address => bool) public verifiers;
    address public owner;
    
    constructor () public {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner allows to invoke this function");
        _;
    }
    
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