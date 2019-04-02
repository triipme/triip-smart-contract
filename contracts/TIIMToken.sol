pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./ERC677Receiver.sol";

contract TIIMToken is StandardToken, Pausable {

    using SafeMath for uint;

    event Released(address indexed receiver, uint amount);
    event Transfer(address indexed sender, address indexed _to, uint _purchase_amount, bytes _data);

    uint    public decimals = 18;
    string  public name = "TriipMiles";
    string  public symbol = "TIIM";
    uint    public totalSupply = 500 * MILLION_TIIM_UNIT;                                        // 500,000,000 TIIM

    uint    public constant DECIMALS_UNIT = 18;
    uint    public constant TIIM_UNIT = 10 ** DECIMALS_UNIT;
    uint    public constant MILLION_TIIM_UNIT = 10 ** 6 * TIIM_UNIT;                             // 10 ^ 6 = 1_000_000 TIIM UNIT

    uint    public constant TIIMCommunityReserveAllocation = 125 * MILLION_TIIM_UNIT;            // 125,000,000 TIIM
    
    uint    public constant TIIMTokenSaleAllocation = 165 * MILLION_TIIM_UNIT;                   // 165,000,000 TIIM
    uint    public constant TIIMEcosystemAllocation = 75 * MILLION_TIIM_UNIT;                    // 75,000,000 TIIM
    uint    public constant TIIMCompanyReserveAllocation = 85 * MILLION_TIIM_UNIT;               // 85,000,000 TIIM
    uint    public constant TIIMTeamAndFounderAllocation = 50 * MILLION_TIIM_UNIT;                         // 50,000,000 TIIM
    
    address public tiimCommunityReserveWallet;
    address public tiimTokenSaleWallet;
    address public tiimEcosystemWallet;
    address public tiimCompanyReserveWallet;
    address public teamWallet;
    address public founderWallet;

    uint    public endTime = 1554051599;                                                        // March 31, 2019 23:59:59 GMT+07:00

    // TIIM team allocation & holding variables
    uint    public constant teamAllocation = 40 * MILLION_TIIM_UNIT;                            // allocate for team : 8% = 40,000,000 TIIM
    
    uint    public totalTeamAllocated = 0;
    uint    public teamTranchesReleased = 0;
    uint    public maxTeamTranches = 12;                                                        // release team tokens 12 tranches every 30 days period
    
    // TIIM founder allocation & holding variables
    uint    public constant founderAllocation = 10 * MILLION_TIIM_UNIT;                          // allocate for founder : 2% = 10,000,000 TIIM
    
    uint    public totalFounderAllocated = 0;
    uint    public founderTranchesReleased = 0;
    uint    public maxFounderTranches = 24;                                                     // release founder tokens 24 tranches every 30 days period
    
    uint    public constant RELEASE_PERIOD = 30 days;

    constructor(address _tiimCommunityReserveWallet, 
                address _tiimTokenSaleWallet, 
                address _tiimEcoWallet, 
                address _tiimCompanyReserveWallet,
                address _teamWallet,
                address _founderWallet) public {

        require(_tiimCommunityReserveWallet != address(0x0), "Community reserve wallet should not be 0x0");
        require(_tiimTokenSaleWallet != address(0x0), "Token sale wallet should not be 0x0");
        require(_tiimEcoWallet != address(0x0), "Ecosystem wallet should not be 0x0");
        require(_tiimCompanyReserveWallet != address(0x0), "Company reserve wallet should not be 0x0");
        require(_teamWallet != address(0x0), "Team wallet should not be 0x0");
        require(_founderWallet != address(0x0), "Founder wallet should not be 0x0");
                    
        tiimCommunityReserveWallet = _tiimCommunityReserveWallet;
        tiimTokenSaleWallet = _tiimTokenSaleWallet;
        tiimEcosystemWallet = _tiimEcoWallet;
        tiimCompanyReserveWallet = _tiimCompanyReserveWallet;
        teamWallet = _teamWallet;
        founderWallet = _founderWallet;

        balances[tiimCommunityReserveWallet] = balances[tiimCommunityReserveWallet].add(TIIMCommunityReserveAllocation);
        balances[tiimTokenSaleWallet] = balances[tiimTokenSaleWallet].add(TIIMTokenSaleAllocation);
        balances[tiimEcosystemWallet] = balances[tiimEcosystemWallet].add(TIIMEcosystemAllocation);
        balances[tiimCompanyReserveWallet] = balances[tiimCompanyReserveWallet].add(TIIMCompanyReserveAllocation);

        emit Transfer(0x0, tiimCommunityReserveWallet, TIIMCommunityReserveAllocation);
        emit Transfer(0x0, tiimTokenSaleWallet, TIIMTokenSaleAllocation);
        emit Transfer(0x0, tiimEcosystemWallet, TIIMEcosystemAllocation);
        emit Transfer(0x0, tiimCompanyReserveWallet, TIIMCompanyReserveAllocation);
    }

    modifier onlyOwner() {
      require(msg.sender == owner, "Only owner able to call this function");
      _;
    }    

    /**
    * @dev ERC20 Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _purchase_amount The amount to be transferred.
    */
    function transfer(address _to, uint _purchase_amount) public whenNotPaused returns (bool) {
        
      return super.transfer(_to, _purchase_amount);
    }    

    /**
    * @dev ERC677 transfer token to a contract address with additional data if the recipient is a contact.
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    * @param _data The extra data to be passed to the receiving contract.
    */
    function transferAndCall(address _to, uint _value, bytes _data) public whenNotPaused returns (bool success) {
      
      super.transfer(_to, _value);
      emit Transfer(msg.sender, _to, _value, _data);
      
      if (isContract(_to)) {
        contractFallback(_to, _value, _data);
      }
      return true;
    }

    function contractFallback(address _to, uint _value, bytes _data)
      private
    {
      ERC677Receiver receiver = ERC677Receiver(_to);
      receiver.onTokenTransfer(msg.sender, _value, _data);
    }

    /**
    * @dev Check address is contract
    * @param _addr address to be checked
    */
    function isContract(address _addr)
      private
      returns (bool hasCode)
    {
      uint length;
      assembly { length := extcodesize(_addr) }
      return length > 0;
    }
    
    /**
        @dev Release TIIM Token to Team based on 12 tranches release every 30 days
        @return true if successful
    */
    function releaseTeamTokens() public onlyOwner whenNotPaused returns (bool) {

        require(totalTeamAllocated < teamAllocation, "Total allocated should less than team allocation definition");
        require(teamTranchesReleased < maxTeamTranches, "Released times should less than max release times definition");
        
        uint currentTranche = now.sub(endTime).div(RELEASE_PERIOD);
        
        if(currentTranche > teamTranchesReleased) {

          uint amount = teamAllocation.div(maxTeamTranches);

          balances[teamWallet] = balances[teamWallet].add(amount);

          totalTeamAllocated = totalTeamAllocated.add(amount);

          teamTranchesReleased++;

          emit Transfer(0x0, teamWallet, amount);
          emit Released(teamWallet, amount);

          return true;
        }

        return false;
    }

    /**
        @dev Release TIIM Token to Founder based on 24 tranches release every 30 days
        @return true if successful
    */
    function releaseFounderTokens() public onlyOwner whenNotPaused returns (bool) {

        require(totalFounderAllocated < founderAllocation, "Total allocated should less than founder allocation definition");
        require(founderTranchesReleased < maxFounderTranches, "Released times should less than max release times definition");

        uint currentTranche = now.sub(endTime).div(RELEASE_PERIOD);

        if (currentTranche > founderTranchesReleased) {
          uint amount = founderAllocation.div(maxFounderTranches);

          balances[founderWallet] = balances[founderWallet].add(amount);

          totalFounderAllocated = totalFounderAllocated.add(amount);

          founderTranchesReleased++;

          emit Transfer(0x0, founderWallet, amount);
          emit Released(founderWallet, amount);

          return true;
        }

        return false;
    }

}