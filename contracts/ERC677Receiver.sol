pragma solidity ^0.4.25;

contract ERC677Receiver {
  function onTokenTransfer(address from, uint256 amount, bytes data) returns (bool success);
}