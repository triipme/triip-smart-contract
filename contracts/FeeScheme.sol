pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

interface IFeeScheme {
    
    function estimateFee(uint value) public view returns (uint);

}

contract PercentageFeeScheme is IFeeScheme, Ownable {

    using SafeMath for uint;
    uint private feePercentage = 1;
    
    function setFee(uint _feePercentage) public onlyOwner {
        feePercentage = _feePercentage;
    }

    function estimateFee(uint _value) public view returns (uint) {
        return _value.div(100).mul(feePercentage);
    }
}


contract FixedFeeScheme is IFeeScheme, Ownable {

    using SafeMath for uint;
    uint private minFee = 10 ** 16;

    function setFee(uint _minFee) public onlyOwner {
        minFee = _minFee;
    }

    function estimateFee(uint value) public view returns (uint) {
        return value.mul(0).add(minFee);
    }
}