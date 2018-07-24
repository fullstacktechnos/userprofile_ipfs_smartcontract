var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, 
          "https://rinkeby.infura.io/" + process.env.INFURA_APIKEY
        );
      },
      network_id: 4,
      gas: 4700000
    }
  }
};
