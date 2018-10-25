const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    //createStar()
    //tokenIdToStarInfo()
    describe('can create a star', () => { 
        it('can create a star and get its info back', async function () { 
            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})

            var star = await this.contract.tokenIdToStarInfo(1)
            assert.equal(star[0], 'awesome star!')
            assert.equal(star[1], 'Too long to tell')
            assert.equal(star[2], '123')
            assert.equal(star[3], '456')
            assert.equal(star[4], '789')
        })

        it('can create a second star with different coordinates (dec) and get its info back', async function () { 
            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})
            await this.contract.createStar('awesome star!', '1234', '456', '789', 'Too long to tell', 2, {from: accounts[0]})

            var star = await this.contract.tokenIdToStarInfo(2)
            assert.equal(star[0], 'awesome star!')
            assert.equal(star[1], 'Too long to tell')
            assert.equal(star[2], '1234')
            assert.equal(star[3], '456')
            assert.equal(star[4], '789')
        })

        it('can create a second star with different coordinates (mag) and get its info back', async function () { 
            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})
            await this.contract.createStar('awesome star!', '123', '4567', '789', 'Too long to tell', 2, {from: accounts[0]})

            var star = await this.contract.tokenIdToStarInfo(2)
            assert.equal(star[0], 'awesome star!')
            assert.equal(star[1], 'Too long to tell')
            assert.equal(star[2], '123')
            assert.equal(star[3], '4567')
            assert.equal(star[4], '789')
        })

        it('can create a second star with different coordinates (cent) and get its info back', async function () { 
            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})
            await this.contract.createStar('awesome star!', '123', '456', '7890', 'Too long to tell', 2, {from: accounts[0]})

            var star = await this.contract.tokenIdToStarInfo(2)
            assert.equal(star[0], 'awesome star!')
            assert.equal(star[1], 'Too long to tell')
            assert.equal(star[2], '123')
            assert.equal(star[3], '456')
            assert.equal(star[4], '7890')
        })

        it('can create two stars', async function () {
            await this.contract.createStar('awesome star 1!', '111', '222', '333', 'Too long to tell 1', 1, {from: accounts[0]})
            await this.contract.createStar('awesome star 2!', '444', '555', '666', 'Too long to tell 2', 2, {from: accounts[0]})
        })

        it('cannot create a star with existing ID', async function () {
            await this.contract.createStar('awesome star 1!', '111', '222', '333', 'Too long to tell 1', 1, {from: accounts[0]})

            await expectThrow(this.contract.createStar('awesome star 2!', '444', '555', '666', 'Too long to tell 2', 1, {from: accounts[0]}))
        })
    })

    //checkIfStarExist()
    describe('can create a star and check if it exists', () => { 
        it('star does not exists if not created', async function () {            
            var starExists = await this.contract.checkIfStarExist('123', '456', '789')
            assert.equal(starExists, false)
        })

        it('can create a star and it does exist', async function () {            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})

            var starExists = await this.contract.checkIfStarExist('123', '456', '789')
            assert.equal(starExists, true)
        })
    })
    

    describe('cannot create a star with same coordinates', () => { 
        it('cannot create a star with same coordinates as an existing one', async function () { 
            
            await this.contract.createStar('awesome star!', '123', '456', '789', 'Too long to tell', 1, {from: accounts[0]})
            
            await expectThrow(this.contract.createStar('awesome star 2!', '123', '456', '789', 'Too long to tell 2', 2, {from: accounts[0]}))
        })
    })

    describe('Get info for non existing token', () => { 
        it('Nothing returned when searching for non existing token', async function () { 
            var tokenId = 1
            var star = await this.contract.tokenIdToStarInfo(tokenId)            
            assert.equal(star[0], '')
            assert.equal(star[1], '')
            assert.equal(star[2], '')
            assert.equal(star[3], '')
            assert.equal(star[4], '')
        })
    })


    //putStarUpForSale()
    //buyStar()    
    //starsForSale()
    describe('buying and selling stars', () => { 
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]
        
        let starId1 = 1
        let starId2 = 2
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar('awesome star 1!', '123', '456', '789', 'Too long to tell 1', starId1, {from: user1})
            await this.contract.createStar('awesome star 2!', '1234', '4567', '7890', 'Too long to tell 2', starId2, {from: user1})
        })

        it('user1 can put up their star for sale', async function () { 
            assert.equal(await this.contract.ownerOf(starId1), user1)
            await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            
            assert.equal(await this.contract._starsForSalePrices(starId1), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId1, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId1), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId1, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })

        it('star for sale is listed', async function () { 
            assert.equal(await this.contract.ownerOf(starId1), user1)
            await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            let stars = await this.contract.starsForSale()
            assert.equal(stars.length, 1)
            assert.equal(stars[0], starId1)
        })

        it('2 star for sale is listed', async function () { 
            await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            await this.contract.putStarUpForSale(starId2, starPrice, {from: user1})
            let stars = await this.contract.starsForSale()
            assert.equal(stars.length, 2)
            assert.equal(stars[0], starId1)
            assert.equal(stars[1], starId2)
        })

        it('star 1 not listed after sold', async function () { 
            await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            await this.contract.putStarUpForSale(starId2, starPrice, {from: user1})
            let stars1 = await this.contract.starsForSale()
            assert.equal(stars1.length, 2)
            assert.equal(stars1[0], starId1)
            assert.equal(stars1[1], starId2)

            await this.contract.buyStar(starId1, {from: user2, value: starPrice, gasPrice: 0})

            let stars2 = await this.contract.starsForSale()
            assert.equal(stars2.length, 1)
            assert.equal(stars2[0], starId2)
        })

        it('star 2 not listed after sold', async function () { 
            await this.contract.putStarUpForSale(starId1, starPrice, {from: user1})
            await this.contract.putStarUpForSale(starId2, starPrice, {from: user1})
            let stars1 = await this.contract.starsForSale()
            assert.equal(stars1.length, 2)
            assert.equal(stars1[0], starId1)
            assert.equal(stars1[1], starId2)

            await this.contract.buyStar(starId2, {from: user2, value: starPrice, gasPrice: 0})

            let stars2 = await this.contract.starsForSale()
            assert.equal(stars2.length, 1)
            assert.equal(stars2[0], starId1)
        })
    })
})

var expectThrow = async function(promise) { 
    try { 
        await promise
    } catch (error) { 
        assert.exists(error)
        return
    }

    assert.fail('Expected an error but didnt see one!')
}