pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./TripVerifier.sol";

contract TripFactory {
    
    event TripCreation(
                address indexed trip, 
                address indexed tripSupplier, 
                string title,
                uint amount);
    
    ERC20 public token;

    function setTIIMToken(address _token) public {
      token = ERC20(_token);
    }
    
    function createTrip(string memory _title, TripVerifier _tripVerifier, uint _amount) public returns(address tripContractAddress) {
        address trip = address(new Trip(_title, _tripVerifier, token, _amount, msg.sender));
        emit TripCreation(trip, msg.sender, _title, _amount);
        return trip;
    }
}

contract Trip is Pausable {
    enum Status { NEW, PUBLIC } 
    
    event BookingCreation(address indexed booking, address indexed traveller);
    event Rating(address indexed reviewer, uint rating, uint avg);
    event PublicTrip();
    
    using SafeMath for uint;
    
    uint public constant avgRatingTrigger = 4;
    uint public constant reviewCountTrigger = 1;
    
    string public title;
    Status public status = Status.NEW;
    TripVerifier public tripVerifier;
    address public tripOwner;
    
    uint public avgRating;
    uint public reviewCount;
    uint public amount;
    
    ERC20 public token;
    
    mapping(address => bool) public validBookingAddress;
    
    constructor (
            string memory _title, 
            TripVerifier _tripVerifier, 
            ERC20 _token,
            uint _amount,
            address _tripOwner
            ) public {
        title = _title;
        tripVerifier = _tripVerifier;
        tripOwner = _tripOwner;
        token = _token;
        amount = _amount;
    }
    
    function book() public {
        bool canBook = false;
        address _traveller = msg.sender;
        
        if(status == Status.NEW) {
            if(tripVerifier.isVerifier(_traveller)){
                canBook = true;
            }
        }else{
            canBook = true;
        }
        
        if(canBook) {
            Booking bookingContract = new Booking(tripOwner, _traveller, address(this), token, amount);
            address booking = address(bookingContract);
            validBookingAddress[booking] = true;
            emit BookingCreation(booking, _traveller);
        }else{
            revert();
        }
        
    }
    
    function isValidBookingAddress(address _booking) public view returns (bool) {
        return validBookingAddress[_booking];
    }
    
    function rating(uint _rating) public {
        require(validBookingAddress[msg.sender] == true, "From booking address or traveller only");
        avgRating = (_rating + (avgRating * reviewCount)) / (reviewCount+1);
        reviewCount = reviewCount.add(1);
        
        if(status == Status.NEW) {
            publicTrip();
            emit PublicTrip();
        }
        
        emit Rating(msg.sender, _rating, avgRating);
    }
    
    function publicTrip() internal {
        if(avgRating > avgRatingTrigger && reviewCount > reviewCountTrigger) {
            status = Status.PUBLIC;
        }
    }
}

contract Booking {
    
    using SafeMath for uint;
    
    enum Status { NEW, APPROVED, PAID, FINISHED, COMPLETED, REJECTED, TRAVELLER_CANCELED, SUPPLIER_CANCELED, REPORTED }
    
    event PAID(address indexed who);
    Trip public trip;
    
    address public tripSupplier;
    address public traveller;
    
    Status public status = Status.NEW;
    
    uint public bookingAmount;
    uint public rating;
    uint public startTime;
    // hard code for testing
    uint public endTime = 123;
    
    ERC20 public token;
    
    
    constructor(
            address _tripSupplier, 
            address _traveller, 
            address _trip,
            ERC20 _token,
            uint _amount
            ) public {
        tripSupplier = _tripSupplier;
        traveller = _traveller;
        trip = Trip(_trip);
        bookingAmount = _amount;
        token = _token;
    }
    
    modifier onlyTripSupplier() {
        require(msg.sender == tripSupplier, "Only trip owner can invoke this function");
        _;
    }
    
    modifier onlyTraveller() {
        require(msg.sender == traveller, "Only traveller can invoke this function");
        _;
    }
    
    function approve() public {
        require(status == Status.NEW, "Status must be New");
        status = Status.APPROVED;
    }
    
    function pay(address _from, uint _amount) public returns(bool) {
        require(address(token) == msg.sender, "Only invoke by call back from pay token");
        require(status == Status.APPROVED, "Status must be Approved");
        require(_amount == bookingAmount, "Require pay amount equals booking amount");
        
        status = Status.PAID;
        
        emit PAID(_from);
        
        return true;
    }
    
    function finish(uint _rating) public onlyTraveller {
        require(status == Status.PAID, "Status must be Paid");
        require(_rating >= 0);
        require(rating == 0, "Must not rate yet");
        require(now > endTime, "Rating after end trip");
        
        rating = _rating;
        status = Status.FINISHED;
        trip.rating(_rating);
    }
    
    function withdrawal() public onlyTripSupplier {
        require(status == Status.FINISHED, "Status must be Finished");
        token.transfer(tripSupplier, bookingAmount);
    }
    
    function tokenFallback(address _from, uint _value, bytes memory _data) public returns(bool) {
        
        return pay(_from, _value);
    }
}