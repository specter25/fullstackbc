
const {STARTING_BALANCE} =require('../config');
const {ec ,cryptoHash} = require('../util/index');
const Transaction=require('./transaction')



class Wallet{
    constructor()
    {
        this.balance=STARTING_BALANCE;

        this.keyPair=ec.genKeyPair();
        this.publicKey =this.keyPair.getPublic().encode('hex');
    }
    sign(data)
    {
        return this.keyPair.sign(cryptoHash(data));
    }
    createTransaction({amount,recepient,chain})
    {
        if(chain)
        {
            this.balance=Wallet.calculateBalance({
                chain,
                address:this.publicKey
            })
        }
        if(amount>this.balance)
        {
            throw new Error('amount exceedes balance')
        }
        return new Transaction({senderWallet:this ,recepient,amount});
    }
    static calculateBalance({chain,address})
    {
        let hasConductedTransaction=false;
        let outputsTotal=0;
        for(let i=chain.length -1 ;i>0 ;i--)
        {
            const block=chain[i];

            for(let transaction of block.data)
            {
                if(transaction.input.address === address)
                {
                    hasConductedTransaction=true;
                }

                const addressOutput=transaction.outputMap[address];
                console.log(addressOutput)
                if(addressOutput)
                {
                    outputsTotal =outputsTotal+ addressOutput;
                }
            }
            if(hasConductedTransaction)
            {
                break;
            }
        }
        console.log(outputsTotal)

        return hasConductedTransaction? outputsTotal : STARTING_BALANCE+outputsTotal;
    }
    static validTran(transaction)
    {
       return Transaction.validTransaction(transaction);
    }
}
module.exports =Wallet;