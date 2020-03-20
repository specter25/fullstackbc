const express=require('express');
const Blockchain=require('./blockchain');
const PubSub=require('./app/pubsub');
const request=require('request')
const app=express();

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS=`http://localhost:${DEFAULT_PORT}`;

//instances
const bc=new Blockchain();
const pubsub=new PubSub({blockchain:bc});


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
    }
})