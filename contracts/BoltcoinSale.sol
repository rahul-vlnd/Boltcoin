pragma solidity 0.5.16;
import "./Boltcoin.sol";

contract BoltcoinSale{

	uint public tokenPrice;
	uint public tokensold;
	address payable admin;
	Boltcoin public tokenContract;

	event Sell
	(
		address buyer,
		uint tokenBought
	);

	modifier OnlyOwner{
		require(admin==msg.sender);
		_;
	}


	constructor(Boltcoin _tokenAddress,uint _tokenPrice) public{
		admin=msg.sender;
		tokenContract=_tokenAddress;
		tokenPrice=_tokenPrice;
	}

	function multiply(uint x,uint y) internal pure returns(uint z){

		require(y==0||(z=x*y)/y==x);
	}

	function buyTokens(uint _numberOfTokens) public payable{

		require(tokenContract.balanceOf(address(this))>=_numberOfTokens);
		require(msg.value==multiply(_numberOfTokens,tokenPrice));
		require(tokenContract.transfer(msg.sender,_numberOfTokens));


		tokensold+=_numberOfTokens;
		emit Sell(msg.sender,_numberOfTokens);
	}

	function balanceContract(address payable addr) public view OnlyOwner returns(uint){
		
		return addr.balance;
	}

	function withdrawfunds() public payable OnlyOwner returns(bool){
		admin.transfer(multiply(tokensold,tokenPrice));
		return true;
	}

	function EndSale() public{
		require(msg.sender==admin);
		require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
		selfdestruct(admin);


	}

}
