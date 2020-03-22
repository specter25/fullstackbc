const uuid=require('uuid/v1');
const Wallet=require('./index');
const {verifySignature}=require('../util/index')

class Transaction{
    constructor({senderWallet ,amount ,recepient})
    {
        this.id=uuid();
        this.outputMap=this.createOutputMap({senderWallet ,amount ,recepient});
        this.input=this.createInput({senderWallet,outputMap :this.outputMap});
    }
    createOutputMap({senderWallet ,amount ,recepient})
    {
        const outputMap={};
        outputMap[recepient]=amount;
        outputMap[senderWallet.publicKey]=senderWallet.balance -amount;

        return outputMap;
    }
    createInput({senderWallet,outputMap})
    {
        return({
            timestamp:Date.now(),
            address:senderWallet.publicKey,
            amount:senderWallet.balance,
            signature:senderWallet.sign(outputMap)
        })
    }
    static validTransaction(transaction)
    {
        const {input:{address,amount,signature} ,outputMap}=transaction;
        const outputTotal = Object.values(outputMap).reduce((total,outputAmount)=>total+outputAmount);
        console.log(outputTotal);
        if(amount !== outputTotal)
        {
            console.error(`invalid outputMap from address :${address}`);
            return false;
        }
        if(!verifySignature({publicKey:address , data:outputMap ,signature}))
        {
            console.error(`invalid signature from address :${address}`);
            return false;
        }
        return true;
    }
    update({senderWallet,recepient,amount})

    {
        if(amount > this.outputMap[senderWallet.publicKey])
        {
            throw new Error('amount exceedes balance');
        }
        if(!this.outputMap[recepient])
        {
            this.outputMap[recepient]=amount;
        }
        else{
            this.outputMap[recepient] +=amount;
        }



        this.outputMap[senderWallet.publicKey]=this.outputMap[senderWallet.publicKey]-amount;
        this.input=this.createInput({senderWallet,outputMap:this.outputMap})
    }
}
module.exports=Transaction