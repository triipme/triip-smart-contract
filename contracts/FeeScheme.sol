pragma solidity ^0.4.25;

interface IFeeScheme {
    
    function estimateFee(uint value) external view returns (uint);

    function estimateContractFee(address _contract, uint _value) external view returns (uint);
}


contract FeeScheme is IFeeScheme {

    function estimateFee(uint value) external view returns (uint) {
        return 0;
    }

    function estimateContractFee(address _contract, uint _value) external view returns (uint) {
        return 0;
    }
}


contract TestOverflowFeeScheme is IFeeScheme {
    
    function estimateFee(uint value) external view returns (uint) {
        return 10 ether;
    }

    function estimateContractFee(address _contract, uint _value) external view returns (uint) {
        return 0;
    }
}