const hexToBinary=require('hex-to-binary');
const Block=require('./block');
const {GENESIS_DATA ,MINE_RATE} =require('../config');
const {cryptoHash}=require('../util/index');


describe('block',()=>{
    const timestamp=2000;
    const data=['blockchain','data'];
    const lastHash='foo-hash';
    const hash='bar-hash';
    const nonce=1;
    const difficulty=1;
    const block= new Block({timestamp,lastHash,hash,data ,nonce,difficulty});
    it ('has all the properties',()=>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
        
    });




    describe('genesis',()=>{

        const genesisBlock= Block.genesis();

        console.log('genesisBlock', genesisBlock);
        
        it('is a instance of block',()=>{
            expect(genesisBlock instanceof Block).toBe(true);
        })
        it('returns the genesis data',()=>{
            expect(genesisBlock).toEqual(GENESIS_DATA);
        })

    })
    describe('minedBlock',()=>{
        lastBlock=Block.genesis();
        minedBlock=Block.mineBlock({lastBlock,data});
        it('is a instance of block',()=>{
            expect(minedBlock instanceof Block).toBe(true);
        })

        it('sets the`data` to match the input' ,()=>
        { expect(minedBlock.data).toEqual(data);
        })

        it('hash of block =  last hash of next block.' ,()=>
        { expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        })

        it('sets the`data` to match the input' ,()=>
        { expect(minedBlock.timestamp).not.toEqual(undefined);
        })

        it('generates the correct sha256 hash based on the inputs' ,()=>
        { expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,data ,minedBlock.nonce,minedBlock.difficulty,lastBlock.hash));
        });
        it ('generates the correct hash based on difficulty',()=>{
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        })
        it('adjusts the difficulty',()=>{
            const possibleResults=[lastBlock.difficulty+1,lastBlock.difficulty-1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        })


    })
    describe('adjust difficulty', () => {



        it('inc the diff for a quickly mined block',()=>{
            // console.log(block.timestamp);
            // console.log(block.difficulty);
            expect(Block.adjustDifficulty({originalBlock:block , timestamp:block.timestamp +MINE_RATE -100})).toEqual(block.difficulty+1);
        })
        it('dec the diff for a slowly mined block',()=>{
            // console.log(block.difficulty);
            expect(Block.adjustDifficulty({originalBlock:block , timestamp:block.timestamp +MINE_RATE +100})).toEqual(block.difficulty-1);
        });
        it('sets the lower limit as 1',()=>{
            block.difficulty=-1;
            expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
        })
        
    })
    

});
