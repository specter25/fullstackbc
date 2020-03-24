const {cryptoHash}=require('../util/index')
const Blockchain=require('.');
const Block=require('./block');
const Wallet=require('../wallet/index');
const Transaction =require('../wallet/transaction');

describe('Blockchain',()=>{
    let blockchain ,newChain,originalChain;
    beforeEach(()=>{
        blockchain=new Blockchain();
        newChain =new Blockchain();
        originalChain=blockchain.chain;
    })



    it ('containe=s the chain array instance',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    })
    it ('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })
    it('adds a new Block to the chain',()=>{
        const newData ='foo-bar';
        blockchain.addBlock({data:newData});
        expect(blockchain.chain[blockchain.chain.length -1].data).toEqual(newData)
    })
    


    describe('is a valid chain',()=>{




        describe('when the chain does not start with a valid genesis Block', () => {
            it('returns false',()=>{
                blockchain.chain[0] ={data:'fake-genesis'};
                expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        })

        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            beforeEach(()=>{
                blockchain.addBlock({ data :'Beers'});
                    blockchain.addBlock({ data :'Beets'});
                    blockchain.addBlock({ data :'Battlestar Galactica'});
            })


            describe('and has a last reference changed', () => {
                it('returns false',()=>{
                    
                    
                    blockchain.chain[2].lastHash='broken-hash';
                    expect(blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            })

            describe('and the chain contains a block with a invalid field', () => {
                it('returns false',()=>{

                    
                    blockchain.chain[2].data ='some-bad-and-evil-data';
                    expect(blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            })
            
            describe('and the chain does not contain any invalid block', () => {
                it('returns true',()=>{
                    

                    expect(blockchain.isValidChain(blockchain.chain)).toBe(true);

                });
            })
            describe('contsins a block with a jumped difficulty', () => {
                it('returns false',()=>{
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const timestamp=Date.now();
                    const nonce=0;
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;
                    const hash=cryptoHash(timestamp,difficulty,nonce,data,lastHash);
                    const badBlock=new Block({timestamp,nonce,difficulty,lastHash,hash,data});
                    blockchain.chain.push(badBlock);
                    expect(blockchain.isValidChain(blockchain.chain)).toBe(false);
                })
            })
            
            
            
        })
        
    })


    describe('replaceChain()',()=>{

        let errorMock ,logMock;
        beforeEach(()=>{
            errorMock=jest.fn();
            logMock=jest.fn();
            global.console.error=errorMock;
            global.console.log =logMock;
        })


        describe('chain is not longer than the present chain', () => {
            it('does not replace the chain',()=>{
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain)
            })

        })
        describe('when the chain is longer', () => {

            beforeEach(()=>{
                newChain.addBlock({ data :'Beers'});
                    newChain.addBlock({ data :'Beets'});
                    newChain.addBlock({ data :'Battlestar Galactica'});
            })


            describe('and the chain is invalid ', () => {
                it('does not replace the chain',()=>{
                    newChain.chain[2].hash ='same-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain)

                })
            })
            describe('and the chain is valid ', () => {
                it('does  replace the chain',()=>{
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
            })
            describe('flag is true', () => {
                it('calls the validateTransactionsfunction',()=>{
                    const mock=jest.fn();
                    blockchain.validTransactionData=mock;
                    newChain.addBlock({data:'foo'});
                    blockchain.replaceChain(newChain.chain,true);
                    expect(mock).toHaveBeenCalled();
                })
            })
            

        })
        
        
    })


    describe('validTransactions', () => {
        let transaction,rewardTransaction ,wallet;


        describe('transactionisvalid',()=>{

            beforeEach(()=>{
                wallet=new Wallet();
                transaction=wallet.createTransaction({recepient:'foo',amount:100});
                rewardTransaction=Transaction.rewardTransaction({miningWallet:wallet});
            }) ;

            it('returns true',()=>{

                newChain.addBlock({data:[transaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true);
            });

            describe('and transaction has multiple rewards', () => {
                it('returns false',()=>{
                    newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                })
            })
            describe('and the transaction has a tampered outut map', () => {
                describe('and the transaction is a non reward transaction', () => {
                    it('returns false',()=>{

                        transaction.outputMap[wallet.publicKey]=999999;
                        newChain.addBlock({data:[transaction,rewardTransaction]});
                        expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    })
                });
                describe('and the transaction is a reward transaction', () => {
                    it('returns false',()=>{
                        rewardTransaction.outputMap[wallet.publicKey]=999999;
                        newChain.addBlock({data:[transaction,rewardTransaction]});
                        expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                    })
                })
                
                
            })
            describe('and the transaction has a tampered input field', () => {
                it('returns false and logs an error',()=>{
                    wallet.balance=9000;
                    const evilOutputMap={
                        [wallet.publicKey]:8900,
                        foo:100
                    }
                    const evilTransaction={
                        input:{
                            timestamp:Date.now(),
                            amount:wallet.balance,
                            address:wallet.publicKey,
                            signature:wallet.sign(evilOutputMap)
                        },
                        outputMap:evilOutputMap
                    }
                    newChain.addBlock({data:[evilTransaction,rewardTransaction]});
                        expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);

                })
            })
            describe('and the block conatins multiple imput transactions', () => {
                it('returns false and logs error',()=>{
                    newChain.addBlock({data:[transaction,transaction ,transaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                })
            })
            
            
            
            
        })
    })
    

    });