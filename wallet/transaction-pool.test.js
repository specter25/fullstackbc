const TransactionPool =require('./transaction-pool');
const Transaction =require('./transaction');
const Wallet=require('./index');
const Blockchain=require('../blockchain/index');

describe('TransactionPool', () => {
    let transactionPool,transaction;
    beforeEach(()=>{
        transactionPool=new TransactionPool();
        transaction =new Transaction({
            senderWallet:new Wallet(),
            recepient:'foo=recepient',
            amount:50,
        });
    });
        describe('setTransaction', () => {
            
            it('add the new transaction to the pool',()=>{
                transactionPool.setTransaction(transaction);
                console.log(transactionPool)
                expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
            })
        })
        describe('validTransaction', () => {
            let validTransactions ,errorMock;
            beforeEach(()=>{
                validTransactions=[];
                errorMock=jest.fn();
                global.console.error=errorMock;
                for(let i=1;i<10;i++)
                {
                    transaction=new Transaction({
                        senderWallet:new Wallet(),
                        recepient:'anyone',
                        amount:30
                    });
                    if(i%3===0)
                    {
                        transaction.input.amount=999999;
                    }
                    else{
                        validTransactions.push(transaction);
                    }
                    transactionPool.setTransaction(transaction);
                }

            });
            it('returns valid trasnactions',()=>{
                expect(transactionPool.validTransactions()).toEqual(validTransactions);
            })
        })

        describe('clear transactions', () => {
            it('clears all transacctions',()=>{
                transactionPool.clear();
                expect(transactionPool.transactionMap).toEqual({});
            })
        })
        describe('clear blockchain transactions', () => {
            it('clears the pool of existing bc transactions',()=>{
                const blockchain=new Blockchain();
 
                let expectedTransactionaMap={};
                for(let i=0;i<6;i++)
                {
                    const transaction=new Transaction({senderWallet:new Wallet() , amount:20, recepient:'foo'})
                    transactionPool.setTransaction(transaction);
                    if(i%2==0)
                    {
                        blockchain.addBlock({data:[transaction]});
                    }
                    else{
                        expectedTransactionaMap[transaction.id]=transaction;
                    }

                }
                transactionPool.clearBlockchainTransactions({chain:blockchain.chain});
                expect(transactionPool.transactionMap).toEqual(expectedTransactionaMap);
            })
        })
        
        
        
        
    
})
