const Boltcoin = artifacts.require("./Boltcoin.sol");
const BoltcoinSale = artifacts.require("./BoltcoinSale.sol");
module.exports = function(deployer) {
  deployer.deploy(Boltcoin,1000000).then(function(){
  	var tokenprice=1000000000000000;
  	return deployer.deploy(BoltcoinSale,Boltcoin.address,tokenprice);
  });
  
};
