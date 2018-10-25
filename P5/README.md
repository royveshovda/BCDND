# Identities
## Contract ID:
0xfd85c62ff0decc4cc64aa78a3213327ed5db3547
https://rinkeby.etherscan.io/address/0xfd85c62ff0decc4cc64aa78a3213327ed5db3547

## Contract Tx:
https://rinkeby.etherscan.io/tx/0xf68ef957320d1cff2174fa229f9fb817ee63dc4d25903b086fe3942fc4a12e81


## createStar Tx:
https://rinkeby.etherscan.io/tx/0x1909fd90d6116cdd47fe17062bf2d89d6150db884bc5f53980d897eccbf1e742
(starID: 1)

## putStarForSale Tx:
https://rinkeby.etherscan.io/tx/0x2d0b2b50f3c1bfe80c600d4bcc331fa0e2c5fec117d72c15bde64a1bbf318169
(starID: 1)

# To run
Start local dev network:
ganache-cli --mnemonic 'scheme target input power arrive slow sausage grace base armor corn bottom'


## Useful commands
truffle deploy --network rinkeby

truffle console --network rinkeby

// createStar
truffle(rinkeby)> StarNotary.at("0xfd85c62ff0decc4cc64aa78a3213327ed5db3547").createStar("Beta Librae", "Also named ubeneschamali", "ra_15h_17m_00.41382s", "dec_-09deg_22min_58.4919sec", "mag_2.61", 1, {from: "0x9b4788e051438f3d11102e3ac839094526ae8d0b"});

// putStarForSale
truffle(rinkeby)> StarNotary.at("0xfd85c62ff0decc4cc64aa78a3213327ed5db3547").putStarUpForSale(1, web3.toWei(.01, "ether"), {from: "0x9b4788e051438f3d11102e3ac839094526ae8d0b"});

// list stars for sale
truffle(rinkeby)> StarNotary.at("0xfd85c62ff0decc4cc64aa78a3213327ed5db3547").starsForSale({from: "0x9b4788e051438f3d11102e3ac839094526ae8d0b"});


// get star info
truffle(rinkeby)> StarNotary.at("0xfd85c62ff0decc4cc64aa78a3213327ed5db3547").tokenIdToStarInfo(1, {from: "0x9b4788e051438f3d11102e3ac839094526ae8d0b"});



## Available Accounts
(0) 0x9b4788e051438f3d11102e3ac839094526ae8d0b (~100 ETH)
(1) 0xb5c25abd7555bc432099594bf77ffa10d52d43c7 (~100 ETH)
(2) 0x54daaedbeef452e5a2624d7ba91bea047524297f (~100 ETH)
(3) 0xfa76da054b96505dc18c9f35ff525ae4cb1a11ad (~100 ETH)
(4) 0x921871fdd7f36b5961890b92de88dbbb0765267a (~100 ETH)
(5) 0x9dfabd5376b4a9c213f8f69042097c988019b048 (~100 ETH)
(6) 0x8481b451a77dff76763a838ae8c62b359f3fa3ad (~100 ETH)
(7) 0x25e2d78baab6f8b05a8b121d535510e25b1a5ed7 (~100 ETH)
(8) 0xbef7565bc21ca580d757c3b89b6780b7cb8a5478 (~100 ETH)
(9) 0xc1e6f96dc08a717c2a9b4da63ed62237c39a7876 (~100 ETH)

## Private Keys
(0) 0x7532b70c7f7d2b4ca01056b2c9e92ab953db2795ea996f0b95ffddcfc54f3550
(1) 0xcc32f2cab6fa435e6a13ec0bfc3a90b5da4261bf63b1f0ec60e40c52950317eb
(2) 0x5061d53f54be76496701aa809047c64ce200ce7d6f1270030f2866964c6728e1
(3) 0xaab3bebccc125d00f9fa6571cea4715938ad9c4a543e9f8043042b1b18a2ebf9
(4) 0x8e236290b1c8d2a03ddc39e0fbc512a51f17de8e9c49a316cc443119c5a88e13
(5) 0xae747c29bd78e0b4becaf7aedaa6a4d3fd8722ab594b0bdf4040bf6635c5162d
(6) 0x2c1a57b23bfcd55424a63ffcba9713beb7ae4f97071e0eafe10ffe819a7ca9ce
(7) 0xcd9e245fcb7e6e56b6f085db5541b5d7d22ab6d5f161611398a2cd97e51bf910
(8) 0x4cabfb97feccba273076b469f125468b81f1856dc63656c37549e005b71ce216
(9) 0x806430451641ca7641dc3ea8e66f0e000b66f4d1e6283a73c354c9160aee5e7c