const Block=require('./block')
const {cryptoHash}= require('../util/index');
const {MINING_REWARD,REWARD_INPUT}=require('../config');
const Wallet=require('../wallet/index')

class Blockchain{
    constructor()
    {
        this.chain=[Block.genesis()];
    }
    
    addBlock({data})
    {
        const lastBlock=this.chain[this.chain.length -1];
        const newBlock = Block.mineBlock({lastBlock ,data});
        this.chain.push(newBlock);
    }

    isValidChain(chain)
    {
        if(JSON.stringify(chain[0])!== JSON.stringify(Block.genesis()))
        {
            return false;
        }
        for (let i=1; i< chain.length ;i++)
        {
            const block=chain[i];
            const lastBlock=chain[i-1];
            const lastDifficulty=lastBlock.difficulty;
            const actualDifficulty=block.difficulty;
            const {timestamp ,lastHash ,hash ,data ,nonce ,difficulty} =block;
            const present=cryptoHash(timestamp,lastHash,data ,nonce , difficulty);
            if(lastHash !== lastBlock.hash || hash !== present   )
            {
                return false;
            }
            if(Math.abs(lastDifficulty-actualDifficulty)>1) return false;
        }
        return true;
    }

    replaceChain(newChain, validateTransactions ,onSuccess)
    {
        if(newChain.length<= this.chain.length)
        {
            console.log('length insufficient');
            return;
        }
        else if( !this.isValidChain(newChain))
        {
            console.log('invalid chain');
            return;
        }

        if( validateTransactions && !this.validTransactionData({chain:newChain}))
        {
            console.error('this is invalid data');
            return;
        }
        if(onSuccess) onSuccess();
        console.log('chain replaced');
        this.chain=newChain;
    }
    validTransactionData({chain})
    {
        console.log( chain.length );
        for (let i=1;i<chain.length;i++)
        {

            const block=chain[i];
            let RewardTransactioncount=0;
            const transactionSet=new Set();
            for(let transaction of block.data)
            {
                if(transaction.input.address === REWARD_INPUT.address)
                {
                    RewardTransactioncount +=1;
                    
                    if(RewardTransactioncount>1) 
                    {
                        console.log('reward transaction count is '+ RewardTransactioncount);
                        console.log('multiple reward transactions');
                        return false;
                    }
                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD)
                    {
                        console.log('invalid mining reward');
                        return false;
                    }
                }
                else
                {
                    console.log(Wallet.validTran(transaction))
                    if(!Wallet.validTran(transaction))
                    {
                        console.error('invalid transaction')
                        return false;
                    }
                    const trueBalance=Wallet.calculateBalance({
                        chain:this.chain,
                        address:transaction.input.address
                    })
                    if(transaction.input.amount !== trueBalance)
                    {
                        console.error('invalid input balance');
                        return false;
                    }
                    
                }
                
                if(transactionSet.has(transaction))
                {
                    console.error('same transaction multiple times');
                    return false;
                }
                else{
                    transactionSet.add(transaction);
                }
            }
        }

        return true;
    }

}

module.exports=Blockchain;