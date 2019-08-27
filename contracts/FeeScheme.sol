pragma solidity ^0.4.25;

interface IFeeScheme {
    function estimateFee(uint value) external view returns (uint);

    function estimateFeeByTransactionType(uint value, uint type) external view returns (uint);
}


contract FeeScheme is IFeeScheme {
    function estimateFee(uint value) external view returns (uint){
        return 0;
    }

    function estimateFeeByTransactionType(uint value, uint type) external view returns (uint){
        return 0;
    }
}

