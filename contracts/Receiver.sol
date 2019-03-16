pragma solidity ^0.4.25;

contract Receiver {
  function onTokenTransfer(address _patron, uint _amount) public {}
  function onTokenTransferWithUint(address _patron, uint _amount, uint _value) public {}
  function onTokenTransferWithByte(address _patron, uint _amount, bytes _data) public {}
}