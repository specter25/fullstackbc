const Block=require('./block')
const cryptoHash= require('./crypto-hash');

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
            const {timestamp ,lastHash ,hash ,data} =block;
            const present=cryptoHash(timestamp,lastHash,data);
            if(lastHash !== lastBlock.hash || hash !== present   )
            {
                console.log('entered')
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain)
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

        console.log('chain replaced');
        this.chain=newChain;
    }
}

module.exports=Blockchain;