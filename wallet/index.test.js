const Wallet = require('./index');
const {verifySignature} =require('../util/index')
const Transaction =require('./transaction');



describe('wallet', () => {
    let wallet;
    beforeEach(()=>{
        wallet=new Wallet();
    })
    it('has a `balance` property',()=>{
        expect(wallet).toHaveProperty('balance');
    })
    it('has a `publicKey` property',()=>{
        console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');
    })
    describe('sign data', () => {
        const data='foo-bar';
        it('verifies valid signature',()=>{
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:wallet.sign(data)
            })).toBe(true);
        })
        it('does not verify invalid signature',()=>{
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:new Wallet().sign(data)
            })).toBe(false);
        })
    })
    describe('create transaction', () => {
        describe('invalid amonut', () => {
            it('throws an error object',()=>{
                expect(()=>wallet.createTransaction({amount:99999 ,recepient:'foo-recepient'})).toThrow('amount exceedes balance');
            })
            
        })
        describe('valid amount', () => {
            let transaction,amount,recepient;
            beforeEach(()=>{
                amount=50;
                recepient='foo=recepient';
                transaction=wallet.createTransaction({amount ,recepient})
            })
            it('is an instance of   Transaction',()=>{
                expect(transaction  instanceof Transaction).toBe(true)
        });
            it('the input matchesthe senderWallet',()=>{
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })
            it('the outPut amount matche sthe sneamount',()=>{
                console.log(transaction)
                expect(transaction.outputMap[recepient]).toEqual(amount)
            })
        })
        
    })
    
    
    
})
