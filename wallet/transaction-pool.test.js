const TransactionPool =require('./transaction-pool');
const Transaction =require('./transaction');
const Wallet=require('./index');

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
        
    
})
