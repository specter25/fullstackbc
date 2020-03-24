const express=require('express');
const Blockchain=require('./blockchain');
const PubSub=require('./app/pubsub');
const request=require('request')
const app=express();
const TransactionPool=require('./wallet/transaction-pool');
const Wallet =require('./wallet/index');
const TransactionMiner=require('./app/transaction-miner')


//variables
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS=`http://localhost:${DEFAULT_PORT}`;

//instances
const bc=new Blockchain();
const transactionPool=new TransactionPool();
const wallet =new Wallet();
const pubsub=new PubSub({blockchain:bc ,transactionPool});
const transactionMiner=new TransactionMiner({blockchain:bc, transactionPool,wallet,pubsub});


//apply middleware
app.use(express.json({ extended: false }));


//routes
app.get('/api/blocks',(req,res)=>{
    res.json(bc.chain);
});



app.post('/api/mine',(req,res)=>{
    const {data} =req.body;
    // console.log({data});
    bc.addBlock({data}); 

    pubsub.broadcastChain();
    res.redirect('/api/blocks');
})



app.post('/api/transact',(req,res)=>{
    const {amount ,recepient} =req.body;

    let transaction;
    transaction=transactionPool.existingTransaction({inputAddress:wallet.publicKey});
try {
    if(transaction)
    {
        transaction.update({senderWallet:wallet ,recepient ,amount , chain:bc.chain});
    }
    else{
        transaction=wallet.createTransaction({amount,recepient});
    }
     

} catch (error) {
    console.log(error);
    return res.status(400).json({type:"error", message:error.message});
}

    transactionPool.setTransaction(transaction);
    console.log(transaction);

    pubsub.broadcastTransaction(transaction);
    res.json({type:"success ", transaction})
});


app.get('/api/transaction-pool-map',(req,res)=>{
    res.json(transactionPool.transactionMap);
})

app.get('/api/mine-transactions',(req,res)=>{
    transactionMiner.mineTransaction();
    res.redirect('/api/blocks');
})


app.get('/api/wallet-info',(req,res)=>{
    res.json({address:wallet.publicKey,
             balance:Wallet.calculateBalance({chain:bc.chain ,address:wallet.publicKey})
    })
})





//functions

const syncChains=()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
        if(!error && response.statusCode === 200)
        {
            const rootChain =JSON.parse(body);
            console.log(rootChain);
            console.log('  REPLACING CHAINS VIA SYNC CHAINS')
            bc.replaceChain(rootChain);
        }
    })
}

const syncTransactions=()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error,response,body)=>{
        if(!error && response.statusCode === 200)
        {
            const rootTransactionMap =JSON.parse(body);
            console.log(rootTransactionMap);
            console.log('  REPLACING MAP VIA SYNC TRANSACTIONMAP')
            transactionPool.setMap(rootTransactionMap); 
        }
    })
}



//port 
let PEER_PORT;
if(process.env.GENERATE_PEER_PORT ==='true')
{
    PEER_PORT=DEFAULT_PORT+(Math.ceil(Math.random()*1000));
}
const PORT =process.env.PORT || DEFAULT_PORT;
app.listen(PORT ,()=>{
    console.log(`listening to port: ${PORT}`);

    if(PORT !== DEFAULT_PORT)
    {
        syncChains();
        syncTransactions();
    }
})