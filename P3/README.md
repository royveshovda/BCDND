# Choice of Node.js framework
The choice for Node.js framework ended up on Express.js. Simply because it is a very mature framework with lots of documentations and examples. It also seems like the framework, of the three options, that was the least opinionated. Which makes it possible to make a clean and simple implementation.

# Installation

This section describes the steps needed to get this project up and running

## Prerequisites
The following needs to be ionstalled on your system:
- Node.js
- NPM

## Steps
### Initialize the project
Use NPM download and install project dependencies listed in package.json.
Open and terminal to the project directory, and run the following command. This is only needed the first time the project is restored to your computer.
```
npm install
```

### Start the server
To start the server run the following command in a terminal:
```
npm run start
```

### Verify the server is running
After the server is running, you can access the different endpoints. A good validation is to open a browser to the following address: [http://localhost:8000/block](http://localhost:8000/block). That endpoint should always give you the latest block height. For a new block chain this will be 0, since the chain only contains the genesis block. You should also be able to query the genesis block at this url [http://localhost:8000/block/1](http://localhost:8000/block/0).

# Endpoints
This section describes the different endpoints available:
- GET /block
- GET /block/{blockHeight}
- POST /block

## GET /block
Will respond with the largest block height available.

## GET /block/{blockHeight}
Will respond with a block object for the requested block height.

## POST /block
Accepts a new block to be added to the chain. Will respond with a complete block connected to the chain.
