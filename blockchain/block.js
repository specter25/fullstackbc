const hexToBinary=require('hex-to-binary');
const {GENESIS_DATA ,MINE_RATE}=require('../config');
const {cryptoHash}=require('../util/index')

class Block{
    constructor({timestamp,lastHash,hash,data ,nonce , difficulty})
    {
        this.timestamp=timestamp;
        this.data=data;
        this.lastHash=lastHash;
        this.hash=hash;
        this.nonce=nonce;
        this.difficulty=difficulty;
    }
    static genesis()
    {
        return new this (GENESIS_DATA);
    }
    static mineBlock({lastBlock,data})
    {
        let {difficulty} = lastBlock;
        let timestamp;
        const lastHash =lastBlock.hash;
        let nonce=0;let hash;
        do
        {
            nonce++;
            timestamp= Date.now();
            difficulty=Block.adjustDifficulty({originalBlock:lastBlock, timestamp});
            hash=cryptoHash(timestamp ,lastHash ,data ,nonce ,difficulty)
        }
        while(hexToBinary(hash).substring(0,difficulty) !== ('0'.repeat(difficulty)))

        return new this ({
            timestamp,
            lastHash:lastBlock.hash,
            data,
            nonce,
            difficulty,
            hash
        })
    }
    static adjustDifficulty({originalBlock , timestamp})
    {
        // console.log(timestamp);
        const {difficulty}= originalBlock;
        if(difficulty<1)return 1;
        const difference= timestamp - originalBlock.timestamp;
        // console.log(difference);
        let value;
        if(difference > MINE_RATE)
        {
            value= difficulty-1;
        }
        else
        {
            value= difficulty+1;
        }
        return value;
    } 
}

module.exports=Block;