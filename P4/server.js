'use strict';

var express = require('express'),
  app = express(),
  port = process.env.PORT || 8000;

app.use(express.json());

// Blockchain handlers
var SC = require('./simpleChain');
let chain = new SC.Blockchain();
let notary = new SC.NotaryService();


let get_root = async function(req, res) {
    res.json({links:[{rel: 'latest', method: 'GET', href: 'http://localhost:8000/block'}]});
};

let isASCII = function(str) {
    return (/^[\x00-\xFF]*$/).test(str);
}

let wordCount = function(str) { 
    return str.split(" ").length;
}

let a2hex = function (str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
      var hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  }
  
  let hex2a = function (hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
  }

let get_block_height = async function(req, res) {
    try{
        console.log(req.originalUrl);
        let height = await chain.getBlockHeight();
        res.json({block_height: height, links:[
            {rel: 'latest', method: 'GET', href: 'http://localhost:8000/block/'+height},
            {rel: 'create', method: 'POST', href: 'http://localhost:8000/block'}
        ]});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
};


let get_a_block_by_height = async function(req, res) {
    try{
        var block = await chain.getBlock(req.params.blockHeight);
        console.log(block);
        res.json(block);
    } catch (error) {
        console.log(error);
        res.status(404).send({message: 'blockheight ' + req.params.blockHeight + ' not found'});
    }
}

let get_all_blocks = async function(){
    let height = await chain.getBlockHeight();
    var blocks = [];
    for (var i = 1; i <= height; i++) { 
        let b = await chain.getBlock(i);
        blocks.push(b)
    }
    return blocks;
}

let decode_story = function(block){
    if(block.hasOwnProperty('body')){
        if(block.body.hasOwnProperty('star')){
            if(block.body.star.hasOwnProperty('story')){
                block.body.star.storyDecoded = hex2a(block.body.star.story);
            }
        }
    }
    return block;
}

let decode_stories = function(blocks){
    let len = blocks.length;
    for (var i = 0; i < len; i++) {
        decode_story(blocks[i]);
    }
    return blocks;
}

let filter_blocks_by_address = function(blocks, address){
    let len = blocks.length;
    var filtered = [];
    for (var i = 0; i < len; i++) {
        let block = blocks[i];
        if(block.hasOwnProperty('body')){
            if(block.body.hasOwnProperty('address')){
                if(block.body.address == address){
                    filtered.push(block);
                }
            }
        }
    }
    return filtered;
}



let get_blocks_by_address = async function(req, res){
    try{
        let blocks = await get_all_blocks();

        let address = req.params.address;

        //TODO: Filter blocks
        let filtered = filter_blocks_by_address(blocks, address);
        
        //Append encoded stories
        let decoded_blocks = decode_stories(filtered);
        
        return res.json(decoded_blocks);
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}

let filter_blocks_by_hash = function(blocks, hash){
    let len = blocks.length;
    for (var i = 0; i < len; i++) {
        let block = blocks[i];
        if(block.hash == hash){
            //return early, should be only one
            return block;
        }
    }
    return {};
}

let get_block_by_hash = async function(req, res){
    try{
        let blocks = await get_all_blocks();

        let hash = req.params.hash;

        //TODO: Filter blocks
        let filtered = filter_blocks_by_hash(blocks, hash);
        
        //Append encoded stories
        let decoded_blocks = decode_story(filtered);
        
        return res.json(decoded_blocks);
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}

let post_a_new_block = async function(req, res) {
    try{
        //Validate request
        let rootKeys = ['address', 'star'];
        for (const key of Object.keys(req.body)) {
            if(!rootKeys.includes(key)){
                return res.status(400).send({message: "Request must only contain 'address' and 'star'"});
            }
        }
        if(!req.hasOwnProperty('body')){
            return res.status(400).send({message: "Try setting Content-type"});
        }
        if(!req.body.hasOwnProperty('address')){
            return res.status(400).send({message: "Request must contain 'address'"});
        }
        if(!req.body.hasOwnProperty('star')){
            return res.status(400).send({message: "Request must contain 'star'"});
        }
        let starKeys = ['ra', 'dec', 'cen', 'mag', 'story'];
        for (const key of Object.keys(req.body.star)) {
            if(!starKeys.includes(key)){
                return res.status(400).send({message: "'star' must only contain 'ra', 'dec', 'cen', 'mag' and 'story'"});
            }
        }
        if(!req.body.star.hasOwnProperty('ra')){
            return res.status(400).send({message: "Request must contain 'star.ra' (right_ascension)"});
        }
        if(!req.body.star.hasOwnProperty('dec')){
            return res.status(400).send({message: "Request must contain 'star.dec' (declination)"});
        }
        if(!req.body.star.hasOwnProperty('story')){
            return res.status(400).send({message: "Request must contain 'star.story'"});
        }
        if(!isASCII(req.body.star.story)){
            return res.status(400).send({message: "'star.story' can only be ascii"});
        }
        if(wordCount(req.body.star.story) > 250){
            return res.status(400).send({message: "'star.story' can be maximum 250 words long"});
        }

        //Encode story as hex
        let hex = a2hex(req.body.star.story);
        let body = req.body;
        body.star.story = hex;
        
        //Verify valid identity check has been performed
        let now = Math.floor(new Date/1000);
        let validIdentity = await notary.hasExistingValidRequest(req.body.address, now);
        if(!validIdentity){
            return res.status(406).send({message: "Identity of address not verified"});
        }

        //Save to blockchain
        let block = new SC.Block(body);
        let completeBlock = await chain.addBlock(block);
        
        //Not saved, only returned
        completeBlock = decode_story(completeBlock);
        
        res.json(completeBlock);
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


// Start identity check process
let initiate_validation = async function(req, res) {
    try{
        if(req.hasOwnProperty('body') && req.body.hasOwnProperty('address')){
            let address = req.body.address;
            let now = Math.floor(new Date/1000);
            let existing = await notary.hasExistingValidRequest(address, now);
            if(existing){
                console.log('Found existing');
                var status = await notary.getRequest(address);
                //Update validationWindow
                let originalTs = status.status.requestTimeStamp
                status.status.validationWindow = (originalTs + SC.MAXVALIDATIONWINDOW) - now;
            }else{
                let message = address + ':' + now.toString() + ':starRegistry';
                status = {registerStar: false, status: {
                    address: address,
                    requestTimeStamp: now,
                    message: message,
                    validationWindow: SC.MAXVALIDATIONWINDOW,
                    messageSignature: "unsigned"
                    }};
                await notary.saveRequestStatus(address, status);
            }

            status.links = [
                {rel: 'sign', method: 'POST', href: 'http://localhost:8000/message-signature/validate'}
            ]
            res.json(status);
        }else{
            res.status(400).send({message: "Request must contain 'address'"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


// Validate id signature for identity is valid
let validate_identity_signature = async function(req, res) {
    try{
        if(req.hasOwnProperty('body') &&
            req.body.hasOwnProperty('address') &&
            req.body.hasOwnProperty('signature')){
            let address = req.body.address;
            let signature = req.body.signature;
            console.log(address)
            console.log(signature)
            let now = Math.floor(new Date/1000);
            let existing = await notary.hasExistingValidRequest(address, now);
            if(existing){
                console.log('Has valid request')
                var status = await notary.getRequest(address);
                //Update validationWindow
                let originalTs = status.status.requestTimeStamp
                status.status.validationWindow = (originalTs + SC.MAXVALIDATIONWINDOW) - now;
                
                //TODO: Validate signature
                let valid = notary.validateSignature(status.status.message, address, signature);
                var msg = ''
                if(valid == true){
                    status.status.messageSignature = 'valid';
                    status.registerStar = true;
                    await notary.saveRequestStatus(address, status);
                    status.links = [
                        {rel: 'register', method: 'POST', href: 'http://localhost:8000/block'}
                    ]
                    res.json(status);
                }else{
                    status.registerStar = false;
                    status.status.messageSignature = 'not valid'
                    res.status(406).send(status);
                }
            }else{
                res.status(412).send({message: "A valid identity check process has not been initiated"});
            }
        }else{
            res.status(400).send({message: "Request must contain 'address' and 'signature'"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


// Routes
app.route('/')
    .get(get_root);

app.route('/block')
    .get(get_block_height)
    .post(post_a_new_block);

app.route('/block/:blockHeight')
    .get(get_a_block_by_height);

app.route('/stars/address::address')
    .get(get_blocks_by_address);

app.route('/stars/hash::hash')
    .get(get_block_by_hash);

app.route('/message-signature/validate')
    .post(validate_identity_signature);

app.route('/requestValidation')
    .post(initiate_validation);

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
  });

app.listen(port);

console.log('RESTful API server started on: ' + port);