const Block=require('./block');
const {GENESIS_DATA} =require('./config');
const cryptoHash=require('./crypto-hash');


describe('block',()=>{
    const timestamp='a-date';
    const data=['blockchain','data'];
    const lastHash='foo-hash';
    const hash='bar-hash';
    const block= new Block({timestamp,lastHash,hash,data});
    it ('has all the properties',()=>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.hash).toEqual(hash);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.data).toEqual(data);
        
    });

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
    data='mined data';
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
    { expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,data ,lastBlock.hash));
    })


})