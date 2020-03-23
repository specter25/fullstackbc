
const Transaction =require('../wallet/transaction');

class TransactionMiner
{
    constructor({transactionPool ,wallet ,blockchain ,pubsub})
    {
        this.blockchain=blockchain;
        this.wallet=wallet;
        this.transactionPool=transactionPool;
        this.pubsub=pubsub;
    }
    mineTransaction()
    {

        //get all the valid transactions
        const validTransactions=Object.values(this.transactionPool.transactionMap)
        .filter(transaction=>
            Transaction.validTransaction(transaction));
        
        //generate a reward and add it as a transaction
        validTransactions.push(
            Transaction.rewardTransaction({miningWallet:this.wallet})
        )
        //add these valid transactions to the bc
        this.blockchain.addBlock({data:validTransactions});
        //broadcast the chain
        this.pubsub.broadcastChain();
        //clear the transaction pool
        this.transactionPool.clear();
    }
}
module.exports=TransactionMiner;