/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const LASTKEY = 'LAST';

async function dbInitiated(){
  try{
		var result = await db.get(LASTKEY);
		return true;
	}catch(err){
    console.log(err);
		return false;
	}
}

async function addLevelDBData(key,value){
  return db.put(key, value);
}

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain{
  constructor(){
		dbInitiated().then(result => {
			if(result == false){
				addLevelDBData(LASTKEY, -1).then(() => {
					console.log("Constructing Genesis Block");
					this.addBlock(new Block("First block in the chain - Genesis block"));
				})
			}else{
				console.log("DB previously initialized. Ready for use.");
			}
		})
  }

  // Add new block
  async addBlock(newBlock){
    // Block height
		var lastKey = await this.getLastKey();
		var newLastKey = lastKey + 1;
    newBlock.height = newLastKey;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);

    // previous block hash
		if(newLastKey>0){
			var previousBlock = await this.getBlock(lastKey);
			newBlock.previousBlockHash = previousBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

		// Adding block object to chain
		await addLevelDBData(LASTKEY, newLastKey);
    await addLevelDBData(newLastKey, JSON.stringify(newBlock));
    return newBlock;
  }

	async getLastKey(){
		try{
			return parseInt(await db.get(LASTKEY));
		}
		catch(err){
			console.log(err);
			return -1;
		}
	}
  // Get block height
  async getBlockHeight(){
		var lastKey = await this.getLastKey();
		var lastBlock = await this.getBlock(lastKey);
		return lastBlock.height;
  }

  // get block
  async getBlock(blockHeight){
		return db.get(blockHeight).then(res => {return (JSON.parse(res))});
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = await this.getBlock(blockHeight);

    // get block hash
    let blockHash = block.hash;

    // remove block hash to test block integrity
    block.hash = '';

    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();

    // Compare
    if (blockHash===validBlockHash) {
      return true;
    } else {
      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain(){
    let errorLog = [];
		var lastKey = await this.getLastKey();

    for (var i = 0; i < lastKey; i++) {
      // validate block
			var blockValid = await this.validateBlock(i);
      if (!blockValid)errorLog.push(i);

      // compare blocks hash link
			let block = await this.getBlock(i);
			let previousBlock = await this.getBlock(i+1);
      let blockHash = block.hash;
      let previousHash = previousBlock.previousBlockHash;
      if (blockHash!==previousHash) {
        errorLog.push(i);
      }
    }

		//Validate last block as well
		var blockValid = await this.validateBlock(lastKey);
		if (!blockValid)errorLog.push(lastKey);

    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
};

module.exports = {
  Block: Block,
  Blockchain: Blockchain
}