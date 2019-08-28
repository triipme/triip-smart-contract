pragma solidity ^0.4.25;

contract BytesUtils {
    
    function sliceBytes(bytes data, uint fromIndex, uint toIndex) public pure returns (bytes) {
        
        bytes memory subdata = new bytes(toIndex - fromIndex);
        
        for(uint i = fromIndex ; i < toIndex ; i++ ) {
            subdata[i-fromIndex] = data[i];
        }
        
        return subdata;
    }
}