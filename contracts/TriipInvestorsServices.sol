pragma solidity ^0.4.25;

/** KPI is 100k target selling period is 45 days*/

/** Reach 100k before 45 days -> payoff immediately through `claim` function */
/** End 45 days & Do not reach 100k -> 
        >= 10% & < 50%  -> 1k
        >= 50% & < 100% -> 5k
        
    Remaining ETH will refund to Triip through `refund` function
*/

contract TriipInvestorsServices {

    uint public KPI_100k = 1;
    uint public KPI_10k = 2;
    uint public KPI_50k = 3;
    
    event Payoff(address _seller, uint _amount, uint _kpi_condition);
    
    event Refund(address _buyer, uint _amount);

    event Claim(address _sender, uint _counting, uint _buyerWalletbalance);
    
    uint balance;
    
    address public buyer; // Triip Protocol wallet use for refunding
    address public seller; // NCriptBit
    address public buyerWallet; // Triip Protocol's raising ETH wallet
    
    uint public start = 0;
    uint public end = 0;
    bool public isEnd = false;
    

    uint decimals = 18;
    uint unit = 10 ** decimals;
    uint paymentAmount = 82 * unit; // equals to 10,000 USD upfront
    uint targetSellingAmount = 820 * unit; // equals to 100,000 USD upfront

    uint claimCounting = 0;

    constructor(address _buyer, address _seller, address _buyerWallet) public {

        seller = _seller;
        buyer = _buyer;
        buyerWallet = _buyerWallet;
        
    }

    function confirmPurchase() public payable {
        
        require(start == 0);
        
        require(msg.value == paymentAmount, "Not equal payment amount");
        
        start = now;
        
        end = start + ( 45 * 1 days );
        
        balance += msg.value;
    }

    function contractEthBalance() public view returns (uint) {
        
        return address(this).balance;
    }

    function buyerWalletBalance() public view returns (uint) {
        
        return address(buyerWallet).balance;
    }
    
    function claim() public returns (uint) {
        
        require(isEnd == false, "This contract should not be end");

        claimCounting = claimCounting + 1;

        uint payoffAmount = 0;
        
        uint buyerWalletBalance = address(buyerWallet).balance;

        emit Claim(msg.sender, claimCounting, buyerWalletBalance);
        
        if ( buyerWalletBalance >= targetSellingAmount) {
            
            payoffAmount = address(this).balance;
            
            seller.transfer(payoffAmount);

            emit Payoff(seller, payoffAmount, KPI_100k);
            
        }
        else{
            
            require(now >= end, "Should end 45 days");
            
            if( buyerWalletBalance >= (targetSellingAmount * 10 / 100) && buyerWalletBalance < (targetSellingAmount * 50 / 100 ) ) {
          
              payoffAmount = address(this).balance * 10 / 100;
              
              seller.transfer(payoffAmount);

              emit Payoff(seller, payoffAmount, KPI_10k);
            
            } else if ( buyerWalletBalance >= (targetSellingAmount * 50 / 100 ) && buyerWalletBalance < targetSellingAmount ) {
                
              payoffAmount = address(this).balance * 50 / 100;
              
              seller.transfer(paymentAmount);

              emit Payoff(seller, payoffAmount, KPI_50k);
            
            }

            isEnd = true;
        }
        
        return payoffAmount;
    }
    
    function refund() public returns (uint) {
        require(now >= end);
        
        claim();
        
        uint refundAmount = address(this).balance;
        
        buyer.transfer(refundAmount);
        
        emit Refund(buyer, refundAmount);
        
        return refundAmount;
    }
}
