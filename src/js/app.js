
App=
{
	web3Provider:null,
	contracts:{},
	account:"0x0",
	loading:null,
	token_Price:0,
	token_sold:0,
	token_available:750000,
	init:function()
	{
		console.log("App Initialized");
		return App.initWeb3();
	},


    initWeb3:function()
    {
    	if(typeof web3!=="undefined")
    	{
    		App.web3Provider= web3.currentProvider;
    		web3= new Web3(web3.currentProvider);
    	}else{
    		App.web3Provider= new Web3.providers.HttpProvider("http://localhost:8545");
    		web3= new Web3(App.web3Provider);
    	}

    	
    	return App.initContracts();
    },

    initContracts:function()
    {
    	$.getJSON('BoltcoinSale.json',function(boltcoinsale)
    	{
    		App.contracts.BoltcoinSale=TruffleContract(boltcoinsale);
    		App.contracts.BoltcoinSale.setProvider(App.web3Provider);
    		App.contracts.BoltcoinSale.deployed().then(function(dapp)
    		     {
    			console.log("BoltcoinSale Address :"+dapp.address);
    		     }).then(function(){
    		     	$.getJSON('BoltCoin.json',function(boltcoin){
    		     		App.contracts.Boltcoin=TruffleContract(boltcoin);
    					App.contracts.Boltcoin.setProvider(App.web3Provider);
    					App.contracts.Boltcoin.deployed().then(function(dapp){
    						console.log("Boltcoin Address :"+dapp.address);
    					});
                            
    						return App.render();
    		     	});
    		     });

         });
    	
    },

    listenForEvents:function(){
    	App.contracts.BoltcoinSale.deployed().then(function(dapp)
		        {
		        	dapp.Sell({},{
		        		fromBlock:0,
		        		toBlock:"latest"
		        	}).watch(function(err,event)
		        			{
		        		console.log("event triggered");
		        		App.render();

		        			});



		        });
    },

    render:function()
    {
    	var coinInstance;
    	var tokenSaleInstance;
    	if(App.loading)
    		{
    		return
    		}
    	App.loading=true;
    	var loader=$("#loader");
		var content=$("#content");
		loader.show();
		content.hide();

    	web3.eth.getCoinbase(function(err,account)
    		{
    		if(err==null){
    			App.account=account;
    			console.log(account);
    			$("#accountAddress").html("<b>Your Account : "+App.account+"</b>");
    					}
    		});
    		App.contracts.BoltcoinSale.deployed().then(function(dapp)
    		    {

    			tokenSaleInstance=dapp;
    			return tokenSaleInstance.tokenPrice();

    		    }).then(function(price)
    		         {
    			App.token_Price=price;
    			$(".token-price").html(web3.fromWei(App.token_Price,"ether").toNumber());
    			return tokenSaleInstance.tokensold();
    		         }).then(function(sold)
    			            {
    			           App.token_sold=sold.toNumber();
    			
    			        $(".tokens-sold").html(App.token_sold);
    			        $(".tokens-available").html(App.token_available);
    			         var progPercent=(App.token_sold/App.token_available)*100;
    			           $("#progress").css("width",progPercent+"%");
    			            });
    			             App.contracts.Boltcoin.deployed().then(function(coin)
    			             {
    				          coinInstance=coin;
    				          return coinInstance.balanceOf(App.account);
    			            }).then(function(bal)
    					             {
    				
				    				$(".blt-balance").html(bal.toNumber());
				    				App.loading=false;
						    		loader.hide();
								    content.show();
						    	
    								})
    	
    
    },

    buyTokens:function()
            {
    	var loader=$("#loader");
		var content=$("#content");
    	loader.show();
		content.hide();
		var numberOftokens=$("#numberOfTokens").val();
		App.contracts.BoltcoinSale.deployed().then(function(dapp)
		        {

		 saleInstance=dapp;
		return saleInstance.buyTokens(numberOftokens,{from:App.account,
			value:numberOftokens*App.token_Price.toNumber(),gas:5000000});
		}).then(function(receipt)
		     {
		    return App.listenForEvents();
			console.log("Token bought");
			$('form').trigger("reset");
		
             });
		
            }






		
    
}

$(function(){
	$(window).on("load", function(){
		App.init();
	})
});