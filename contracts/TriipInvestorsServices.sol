pragma solidity ^0.4.25;

/** KPI is 100k target sell in 45 days*/

/** Reach 100k before 45 days -> payoff immediately through claim function*/
/** End 45 days & Do not reach 100k -> 
        >= 10% & < 50%  -> 1k
        >= 50% & < 100% -> 5k 
        >= 100%         -> 100k 
        
    Remaining ETH will refund to Triip    
*/

contract TriipInvestorsServices {
    
    event Payoff(address _seller, uint _amount);
    
    event Refund(address _buyer, uint _amount);
    
    uint balance;
    
    address public buyer; // Triip Protocol wallet use for refunding
    address public seller; // NCriptBit
    address public buyerWallet; // Triip Protocol's raising ETH wallet
    
    uint private start = 0;
    uint private end = 0;
    
    uint paymentAmount = 1; // equals to 10,000 USD upfront
    uint targetSellingAmount = 10; // equals to 100,000 USD upfront

    constructor(address _buyer, address _seller, address _buyerWallet) public {

        seller = _seller;
        buyer = _buyer;
        buyerWallet = _buyerWallet;
        
    }

    function confirmPurchase() public payable {
        require(start == 0);
        
        require(msg.value == paymentAmount * 1 ether);
        
        start = now;
        
        end = start + ( 45 * 1 days );
        
        balance += msg.value;
    }
    
    function claim() public returns (uint) {
        
        uint payoffAmount = 0;
        
        uint buyerWalletBalance = address(buyerWallet).balance;
        
        if ( buyerWalletBalance >= targetSellingAmount) {
            
            payoffAmount = paymentAmount;
            
            seller.transfer(payoffAmount);
            
        }
        else{
            
            require(end > now);
            
            if( buyerWalletBalance >= (targetSellingAmount * 10 / 100 ) && buyerWalletBalance < (targetSellingAmount * 50 / 100 ) ) {
          
              payoffAmount = paymentAmount * 10 / 100;
              
              seller.transfer(payoffAmount);
            
            } else if ( buyerWalletBalance >= (targetSellingAmount * 50 / 100 ) && buyerWalletBalance < targetSellingAmount ) {
                
              payoffAmount = paymentAmount * 50 / 100;
              
              seller.transfer(paymentAmount);
            
            }
        }
        
        emit Payoff(seller, payoffAmount);
        
        return payoffAmount;
    }
    
    function refund() public returns (uint) {
        require(end > now);
        
        claim();
        
        uint refundAmount = address(this).balance;
        
        buyer.transfer(refundAmount);
        
        emit Refund(buyer, refundAmount);
        
        return refundAmount;
    }
}
