var Boltcoin=artifacts.require("./Boltcoin.sol");

contract("Boltcoin",function(accounts)
{
	var admin=accounts[0];
	
	it("Sets the total supply",function()
	{
		return Boltcoin.deployed().then(function(i)
		{
			tokeninstance=i;
			return tokeninstance.totalSupply();
		}).then(function(supply)
			{
			  assert.equal(supply.toNumber(),1000000,"It sets the total supply of 1000000(1 Million)");
			  return tokeninstance.balanceOf(admin);
			}).then(function(balance)
				 {
					assert.equal(balance.toNumber(),1000000,"It sets the initial balance to admin address");
						
			     });


    });


    it("Initializse the contract with right values",function()
    {
    	return Boltcoin.deployed().then(function(i)
    	    {
    		tokeninstance=i;
    		return tokeninstance.name();
			}).then(function(name)
				{
					assert.equal(name,"Boltcoin","It sets the name of the coin");
					return tokeninstance.symbol();
				}).then(function(symb)
					{
						assert.equal(symb,"BLT","It sets the Symbol of the coin");
						return tokeninstance.standard();
					}).then(function(std)
					   {

						assert.equal(std,"Boltcoin v1.0","It sets the standard of coin");
					   });

    });

     it("Transfer ownership of token",function()
    {
    	return Boltcoin.deployed().then(function(i)
    	    {
    		tokeninstance=i;
    		return tokeninstance.transfer.call(accounts[1],99999999,{from :admin});
			}).then(assert.fail).catch(function(error)
			   {
				assert(error.message.indexOf('revert')>=0,"Should revert if insufficient balance");
				return tokeninstance.transfer.call(accounts[1],250000,{from :admin});
			   }).then(function(success){
			   	assert.equal(success,true,"Transfer is sucess");
				return tokeninstance.transfer(accounts[1],250000,{from :admin});
			    }).then(function(receipt)
			       {
			       	    assert.equal(receipt.logs.length,1,"Triggers one event");
			       	    assert.equal(receipt.logs[0].event,"Transfer",'Triggers the "Transfer" event');
			       	    assert.equal(receipt.logs[0].args._from,admin,'logs the from address');
			       	    assert.equal(receipt.logs[0].args._to,accounts[1],'logs the to address');
			       	    assert.equal(receipt.logs[0].args._value.toNumber(),250000,'logs the transfer amount');
			       		return tokeninstance.balanceOf(accounts[1]);
			       }).then(function(bal)
			           {
			           		assert.equal(bal.toNumber(),250000,"Succesfully transfered value");
			           		return tokeninstance.balanceOf(admin);
			           }).then(function(bal)
			                {
			       				assert.equal(bal.toNumber(),750000,"Succesfully reducted value from sender");
			                });
    });



    it("Approves token for delegated transfer",function()
    {

    	return Boltcoin.deployed().then(function(i)
    	{
    		tokeninstance=i;
    		return tokeninstance.approve.call(accounts[1],100,{from:admin});
    	}).then(function(success)
    	    {
    		assert.equal(success,true,"Return true for suucessful approval");
    		return tokeninstance.approve(accounts[1],100,{from :admin});
    	    }).then(function(receipt)
			       {
			       	    assert.equal(receipt.logs.length,1,"Triggers one event");
			       	    assert.equal(receipt.logs[0].event,"Approval",'Triggers the "Transfer" event');
			       	    assert.equal(receipt.logs[0].args._owner,admin,'logs the from address');
			       	    assert.equal(receipt.logs[0].args._spender,accounts[1],'logs the to address');
			       	    assert.equal(receipt.logs[0].args._value.toNumber(),100,'logs the transfer amount');
			       		return tokeninstance.allowance(admin,accounts[1]);
			       }).then(function(allowance)
			          {
			          	assert.equal(allowance,100,"Added the corresponding value to allowance ");
			          	return tokeninstance.approve(accounts[1],10000000000,{from :admin});
			          }).then(assert.fail).catch(function(error)
			          	  {
			          	  	assert(error.message.indexOf("revert")>=0,"Reverted due to insufficient balance");
			              });

    });


    it("It handles delegated token transfer",function()
    {
          
          return Boltcoin.deployed().then(function(i)
          {
          	tokeninstance=i;
          	fromAccount=accounts[3];
          	toAccount=accounts[4];
          	SpenderAccount=accounts[5];
          	return tokeninstance.transfer(fromAccount,250000,{from :admin});
		  }).then(function(receipt)
			 {
           	     return tokeninstance.approve(SpenderAccount,50000,{from:fromAccount});
             }).then(function(receipt)
                {
                	return tokeninstance.transferFrom.call(fromAccount,toAccount,10000,{from:SpenderAccount});
                }).then(function(success)
                   {
                	assert.equal(success,true,"Successful transfer returns true");
                	return tokeninstance.transferFrom(fromAccount,toAccount,100000,{from:SpenderAccount});
                   }).then(assert.fail).catch(function(error)
                      {
                	   assert(error.message.indexOf('revert')>=0,"Reverted due to insufficient balance");
                	   return tokeninstance.transferFrom(fromAccount,toAccount,10000,{from:SpenderAccount});
                      }).then(function(receipt)
                        {
                        assert.equal(receipt.logs.length,1,"Triggers one event");
			       	    assert.equal(receipt.logs[0].event,"Transfer",'Triggers the "Transfer" event');
			       	    assert.equal(receipt.logs[0].args._from,fromAccount,'logs the from address');
			       	    assert.equal(receipt.logs[0].args._to,toAccount,'logs the to address');
			       	    assert.equal(receipt.logs[0].args._value.toNumber(),10000,'logs the transfer amount');
			       	    

			       	    return tokeninstance.balanceOf(fromAccount);
                        }).then(function(balance){
                        	//console.log(balance);
                        	assert.equal(balance.toNumber(),240000,"Deducted the transfered amount from the fromAccount");
                           	return tokeninstance.balanceOf(toAccount);
                        }).then(function(balance){
                        	//console.log(balance);
                        	assert.equal(balance.toNumber(),10000,"Added the transfered amount from the fromAccount to the receiver");
                            return tokeninstance.allowance(fromAccount,SpenderAccount);
                        }).then(function(balance){
                        	//console.log(balance);
                        	
                        	assert.equal(balance.toNumber(),40000,"Reduced value from allowance of spender account from FromAccount");
                        
                        });

    });


});