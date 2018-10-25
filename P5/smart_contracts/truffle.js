var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'scheme target input power arrive slow sausage grace base armor corn bottom';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/60850bc7507943eab3237d997d113606') 
      },
      network_id: 4,
      gas: 6700000,
      gasPrice: 10000000000,
    }
  }
};