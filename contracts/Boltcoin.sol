pragma solidity 0.5.16;

contract Boltcoin{
    uint public totalSupply;
    uint8 public decimals=18;
    string public name="Boltcoin";
    string public symbol="BLT";
    string public standard="Boltcoin v1.0";
    address admin;
    bool isActive=true;

    mapping(address=>uint) public balanceOf;
    mapping(address=>mapping(address=>uint)) public allowance;

    modifier onlyOwner(){
        require(admin==msg.sender);
        _;
    }

    modifier active(){
        require(isActive);
        _;
    }

    modifier deactive(){
         require(!isActive);
        _;
    }
    
    event Transfer
    (
    	address indexed _from,
    	address indexed _to, 
    	uint256 _value
    );

    event Approval
    (
    	address indexed _owner, 
    	address indexed _spender, 
    	uint256 _value
    );

    constructor(uint _initialSupply) public{
        totalSupply=_initialSupply;
        balanceOf[msg.sender]=_initialSupply;        
        //admin=msg.sender;
    }

    function deactivate() public onlyOwner active{
        isActive=false;
    }

    function activate() public onlyOwner deactive{
        isActive=true;
    }



    function transfer(address _to, uint256 _value) public active  returns (bool success){
    	require(balanceOf[msg.sender]>=_value);

    	balanceOf[msg.sender]-=_value;
    	balanceOf[_to]+=_value;
    
    	emit Transfer(msg.sender,_to,_value);
    	return true;
    }


    function approve(address _spender, uint256 _value) public active   returns (bool success){

    	require(balanceOf[msg.sender]>=_value);

    	allowance[msg.sender][_spender]+=_value;

    	emit Approval(msg.sender,_spender,_value);
    	return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public active returns (bool success){
    	require(balanceOf[_from]>=_value);
    	require(allowance[_from][msg.sender]>=_value);
    	balanceOf[_from]-=_value;
    	balanceOf[_to]+=_value;
    	allowance[_from][msg.sender]-=_value;

    	emit Transfer(_from,_to,_value);
    	return true;
    }

    function BurnCoin (uint256 _value) public active returns(bool){
        return transfer(address(0),_value);
    }
    
}