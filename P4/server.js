'use strict';

var express = require('express'),
  app = express(),
  port = process.env.PORT || 8000;

app.use(express.json());

// Blockchain handlers
var SC = require('./simpleChain');
let chain = new SC.Blockchain();
let notary = new SC.NotaryService();


// Bitcoin libraries
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');


let get_root = async function(req, res) {
    res.json({links:[{rel: 'latest', method: 'GET', href: 'http://localhost:8000/block'}]});
};


let get_block_height = async function(req, res) {
    try{
        console.log(req.originalUrl);
        let height = await chain.getBlockHeight();
        res.json({block_height: height, links:[
            {rel: 'latest', method: 'GET', href: 'http://localhost:8000/block/'+height},
            {rel: 'create', method: 'POST', href: 'http://localhost:8000/block'}
        ]});
    } catch (error) {
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
};


let get_a_block = async function(req, res) {
    try{
        var block = await chain.getBlock(req.params.blockHeight);
        console.log(block);
        res.json(block);
    } catch (error) {
        console.log(error);
        res.status(404).send({message: 'blockheight ' + req.params.blockHeight + ' not found'});
    }
}


let post_a_new_block = async function(req, res) {
    try{
        let block = new SC.Block(req.body.body);
        let completeBlock = await chain.addBlock(block);
        res.json(completeBlock);
    } catch (error) {
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


// Start identity check process
let initiate_identity_validation = async function(req, res) {
    try{
        //console.log(req.body)
        if(req.hasOwnProperty('body') && req.body.hasOwnProperty('wallet_id')){
            let walletId = req.body.wallet_id;
            let now = Math.floor(new Date/1000);
            let existing = await notary.hasExistingValidRequest(walletId, now);
            console.log('Max:')
            console.log(SC.MAXVALIDATIONWINDOW)
            if(existing){
                console.log('Found existing');
                var status = await notary.getRequest(walletId);
                //Update validationWindow
                let originalTs = status.status.requestTimeStamp
                status.status.validationWindow = (originalTs + SC.MAXVALIDATIONWINDOW) - now;
            }else{
                let message = walletId + ':' + now.toString() + ':starRegistry';
                status = {registerStar: true, status: {
                    address: walletId,
                    requestTimeStamp: now,
                    message: message,
                    validationWindow: SC.MAXVALIDATIONWINDOW,
                    messageSignature: "unsigned"
                    }};
                await notary.saveRequestStatus(walletId, status);
            }

            status.links = [
                {rel: 'sign', method: 'POST', href: 'http://localhost:8000/message-signature/validate'}
            ]
            res.json(status);
        }else{
            res.status(401).send({message: "Request must contain 'wallet_id'"});
        }
    } catch (error) {
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


// Validate id signature for identity is valid
let validate_identity_signature = async function(req, res) {
    try{
        //TODO
        res.json({message: 'Not implemented (2)'});
    } catch (error) {
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
}


//Check if walletID has valid request session
let validate_identity_request = async function(req, res) {
    try{
        //TODO
        res.json({message: 'Not implemented (3)'});
    } catch (error) {
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
    .get(get_a_block);

app.route('/message-signature')
    .post(initiate_identity_validation);

app.route('/message-signature/validate')
    .post(validate_identity_signature);

app.route('/requestValidation')
    .post(validate_identity_request);

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
  });

app.listen(port);

console.log('RESTful API server started on: ' + port);