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
                status = {registerStar: true, status: {
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
            res.status(40).send({message: "Request must contain 'address'"});
        }
    } catch (error) {
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
                    status.status.messageSignature = 'valid'
                    await notary.saveRequestStatus(address, status);
                    //status.links = [
                    //    {rel: 'sign', method: 'POST', href: 'http://localhost:8000/message-signature/validate'}
                    //]
                    res.json(status);
                }else{
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

app.route('/message-signature/validate')
    .post(validate_identity_signature);

app.route('/requestValidation')
    .post(initiate_validation);

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
  });

app.listen(port);

console.log('RESTful API server started on: ' + port);