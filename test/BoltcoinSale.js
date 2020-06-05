var BoltcoinSale=artifacts.require("./BoltcoinSale.sol");
var Boltcoin=artifacts.require("./Boltcoin.sol");

contract("BoltcoinSale",function(accounts)
{
	var saleInstance;
	var tokenInstance;
	var tokenprice=100000000000000;//0.0001 Ether
	var admin=accounts[0];
	var buyer=accounts[1];
	var numberOftokens=10000;
	var tokenSaleTokens=750000;
	var AdminTokens=1000000-tokenSaleTokens;
   it("Initializes the contract with correct values",function()
   {

   		return BoltcoinSale.deployed().then(function(i)
   		{
   			saleInstance=i;
   			return saleInstance.address;
   		}).then(function(addr)
   		  {
   			//console.log(addr);
   			assert.notEqual(addr,"0x0","Sale contract has an address");
   			return saleInstance.tokenContract();
   		  }).then(function(addr)
   		    {
            //console.log(addr);
   			assert.notEqual(addr,"0x0","Token contract has an address");
   			return saleInstance.tokenPrice();
   		    }).then(function(price)
   		       {

   		    	assert.equal(price.toNumber(),tokenprice,"Token price is correct");
   		       });
 

   });

   it("Fascilitiates the buying of tokens",function()
   {
   		return Boltcoin.deployed().then(function(i)
   		 {
   			tokenInstance=i;
   			return BoltcoinSale.deployed();
   		 }).then(function(i)
   		    {
   			 saleInstance=i;
   			 return tokenInstance.transfer(saleInstance.address,tokenSaleTokens,{from:admin});
   		    }).then(function(receipt)
   		      {
   			    return saleInstance.buyTokens(numberOftokens,{from:buyer,value:numberOftokens*tokenprice});
   		      }).then(function(receipt)
   		         {
   			      assert.equal(receipt.logs.length,1,"Triggers one event");
			      assert.equal(receipt.logs[0].event,"Sell",'Triggers the "Transfer" event');
			      assert.equal(receipt.logs[0].args.buyer,buyer,'logs the Buyer address');
			      assert.equal(receipt.logs[0].args.tokenBought,numberOftokens,'logs number of tokens bought');
   			      return saleInstance.tokensold();
   		         }).then(function(num)
   		           {
   			       assert.equal(num.toNumber(),numberOftokens,"Correctly updates the number of tokens sold ");
   			       return saleInstance.buyTokens(750000,{from:accounts[3],value:750000*tokenprice});
   		           }).then(assert.fail).catch(function(error) 
   		             {
   		              assert(error.message.indexOf('revert')>=0,"Cant buy more than the tokensale contract'balance");
   		              return saleInstance.buyTokens(25000,{from:accounts[3],value:tokenprice});
   		             }).then(assert.fail).catch(function(error) 
   		                {

   		              assert(error.message.indexOf('revert')>=0,"message value must be equal to token value in wei");
   		              return tokenInstance.balanceOf(admin);
   		               }).then(function(bal){
   		               	assert.equal(bal.toNumber(),AdminTokens,"Correctly distributed tokens");
   		               });
   		
   });

    it("Fascilitiates successful transfer of funds to admin",function()
    {

    	return BoltcoinSale.deployed().then(function(i){
    		saleInstance=i;
    		return saleInstance.balanceContract(saleInstance.address,{from:accounts[0]});
    	}).then(function(bal){
    		assert.equal(bal.toString(),numberOftokens*tokenprice,"updated balance equals contract balance");
    		return saleInstance.withdrawfunds({from:admin});
    	}).then(function(receipt){
    		return saleInstance.balanceContract(saleInstance.address,{from:accounts[0]});
    	}).then(function(bal){
    		
    		assert.equal(bal.toNumber(),0,"successful transfer of funds to administrator");
    	});

    });    it("Fascilitiate the end of sale",function()
    {
   		return Boltcoin.deployed().then(function(i)
   		 {
   			tokenInstance=i;
   			return BoltcoinSale.deployed();
   		 }).then(function(i)
   		    {
   			 saleInstance=i;
   			 return saleInstance.EndSale({from:buyer});
   		    }).then(assert.fail).catch(function(error)
   		      {
   		    	assert(error.message.indexOf("revert")>=0,"Function succesfully revert if msg.sender!=admin");
   		    	return saleInstance.EndSale({from:admin});
   		      }).then(function(receipt){
   		      	return tokenInstance.balanceOf(admin);
   		      }).then(function(bal){
   		      	assert.equal(bal.toNumber(),(AdminTokens+tokenSaleTokens-numberOftokens),"Succefully transfers the remaining tokens to admin");
   		      	return saleInstance.tokensold();
   		      }).then(assert.fail).catch(function(error){
   		      	//console.log(error);
   		      	//assert(error.message.indexOf("hijackedStack")>=0);
   		      });


   	});
   


    });



