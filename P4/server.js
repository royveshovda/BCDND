'use strict';

var express = require('express'),
  app = express(),
  port = process.env.PORT || 8000;

app.use(express.json());

// Blockchain handlers
var SC = require('./simpleChain');
let chain = new SC.Blockchain();

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
        res.json({block_height: height, links:[{rel: 'latest', method: 'GET', href: 'http://localhost:8000/block/'+height}, {rel: 'create', method: 'POST', href: 'http://localhost:8000/block'}]});
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
};

let post_a_new_block = async function(req, res) {
    try{
        let block = new SC.Block(req.body.body);
        let completeBlock = await chain.addBlock(block);
        res.json(completeBlock);
    } catch (error) {
        res.status(500).send({message: 'We are sorry to report that something went very wrong'});
    }
};

// Routes
app.route('/')
    .get(get_root);

app.route('/block')
    .get(get_block_height)
    .post(post_a_new_block);

app.route('/block/:blockHeight')
    .get(get_a_block);

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
  });

app.listen(port);

console.log('RESTful API server started on: ' + port);