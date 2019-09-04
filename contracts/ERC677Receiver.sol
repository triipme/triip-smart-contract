pragma solidity ^0.4.25;

import "./FeeScheme.sol";

interface ERC677Receiver {
  function onTokenTransfer(address from, uint256 amount, bytes data) returns (bool success);
}

contract MockedBookingReceiverFixedFee is ERC677Receiver, IFeeScheme {
    
    function onTokenTransfer(address from, uint256 amount, bytes data) returns (bool success) {
        return true;
    }

    function estimateFee(uint value) public view returns (uint) {
        return 5;
    }
}

contract MockedBookingReceiverZeroFee is ERC677Receiver, IFeeScheme {
    
    function onTokenTransfer(address from, uint256 amount, bytes data) returns (bool success) {
        return true;
    }

    function estimateFee(uint value) public view returns (uint) {
        return 0;
    }
}