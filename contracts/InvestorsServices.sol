pragma solidity ^0.4.19;

contract InvestorsServices {
    uint balance;
    address public buyer; //Triip Protocol
    address public seller; // NCriptBit
    uint private start;
    uint amount = 10; // equals to 10000 USD upfront
    uint[] installment; // installment period
    uint[] lockupPeriod; // lock instalmenst time

    uint currentStage = 0;

    function InvestorsServices() public {
        seller = msg.sender;

        installment.push(40); // 40 percent of ammout
        lockupPeriod.push(1); // 1 day lockup for fisrt payment

        installment.push(20); // 20 percent of ammout
        lockupPeriod.push(8); // 8 days lockup for second payment

        installment.push(20); // 20 percent of ammout
        lockupPeriod.push(15); // 15 days lockup for third payment

        installment.push(20); // 20 percent of ammout
        lockupPeriod.push(22); // 22 days lockup for fourth payment
    }

    function confirmPurchase() public payable {
        require(msg.value == amount * 1 ether);

        buyer = msg.sender;
        start = now;

        balance += msg.value;

        process();
    }

    function process() public returns (uint) {
        require(currentStage < installment.length);
        require(buyer != address(0)); // asks for Triips ETH address
        require(seller != address(0)); // asks for NCryptBits ETH address

        uint currentLockupStagePeriod = getCurrentLockupStagePeriod();

        if (now > start + currentLockupStagePeriod * 1 days)
        {
          seller.transfer(amount * 1 ether * installment[currentStage] / 100);
          currentStage = currentStage + 1;

          return 0;
        }

        return 1;
    }

    function getCurrentLockupStagePeriod() private returns (uint) {
      uint i = 0;
      uint currentLockupStagePeriod = 0;

      for(i; i <= currentStage; i++)
      {
          currentLockupStagePeriod = currentLockupStagePeriod + lockupPeriod[i];
      }

      return currentLockupStagePeriod;
    }

    function refund() public {
      require(msg.sender == buyer);
      require(msg.value == amount * 1 ether);
      uint currentLockupStagePeriod = getCurrentLockupStagePeriod();

      if (now > start + currentLockupStagePeriod * 1 days)
      {
          seller.transfer(amount * 30/100 ether); 
          selfdestruct(buyer); // refund function of 30% before installments period. 
      }
    }

    function getBuyer() public view returns (address) {
      return buyer;
    }

    function getSeller() public view returns (address) {
      return seller;
    }

    function getBalance() public view returns (uint) {
      return balance;
    }

    function getStage() public view returns (uint) {
      return currentStage;
    }

    function getStart() public view returns (uint) {
      return start;
    }

    function getNow() public view returns (uint) {
      return block.timestamp;
    }

    function kill() public constant {
        if (msg.sender == seller) {
            selfdestruct(buyer);
        }
    }
}
