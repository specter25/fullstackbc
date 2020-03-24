const Transaction=require('./transaction');
const Wallet =require('./index');
const {verifySignature}=require('../util/index')
const {MINING_REWARD ,REWARD_INPUT} =require('../config');

describe('transaction', () => {
    let transaction , senderWallet,recepient , amount ,logMock;
    beforeEach(()=>{
        logMock=jest.fn();
        global.console.log=logMock;
        senderWallet=new Wallet();
        amount=50;
        recepient='receiver-public-key';
        transaction=new Transaction({senderWallet ,recepient ,amount})

    });
    it('has a `id`',()=>{
        expect(transaction).toHaveProperty('id');
    });
    describe('output Map', () => {
        it('has propert `outputmap`',()=>{
            console.log(transaction);
            expect(transaction).toHaveProperty('outputMap');
        });
        it('outputs the amount to the recepient',()=>{
            expect(transaction.outputMap[recepient]).toEqual(amount);
        });
        it('outputs remaining amount fro sender wallet',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance -amount);
        })
    })
    describe('input', () => {
        it('has a `id`',()=>{
            expect(transaction).toHaveProperty('input');
        });   
        it('set the amount to the sender balance',()=>{
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });
        it('set the address to the sender publicKey',()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });
        it('signs the input',()=>{
            expect(verifySignature({
                publicKey:senderWallet.publicKey,
                data:transaction.outputMap,
                signature:transaction.input.signature
            })).toBe(true)
        })
    })
    describe('validate the transaction', () => {

        let errorMock;
        beforeEach(()=>{
            errorMock=jest.fn();
            global.console.error=errorMock;
        })
        describe('transaction is valid', () => {
            it('returns true',()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true)
            })
        })
        describe('transaction is invalid', () => {
            describe('outputMap is invaid', () => {
                it('return false',()=>{
                    transaction.outputMap[senderWallet.publicKey]=99999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            })
            describe('signature is invalid', () => {
                it('return false',()=>{
                    transaction.input.signature=new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
                
            })
            
            
        })
        
        
        
    })

    describe('update()', () => {
        let originalSignature,originalSenderAmount ,nextRecepient,nextAmount
        beforeEach(()=>{
            originalSignature=transaction.input.signature;
            originalSenderAmount=transaction.outputMap[senderWallet.publicKey];
            nextRecepient="next-recepient";
            nextAmount=50;
            transaction.update({senderWallet ,amount:nextAmount ,recepient:nextRecepient})
        })
        describe('amount is valid',()=>{
            it('outputs the amount to  the recepient',()=>{
                expect(transaction.outputMap[nextRecepient]).toEqual(nextAmount);
            })
            it('outputs the substracts amount from sener allet',()=>{
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderAmount- nextAmount);
            })
            it('total output is equal to total input',()=>{
                expect(Object.values(transaction.outputMap).reduce((total,outputAmount)=>total+outputAmount)).toEqual(transaction.input.amount);
            })
            it('resigns the data',()=>{
                console.log(transaction.input.signature )
                expect(transaction.input.signature).not.toEqual(originalSignature);
            })
            describe('add another update for the same recepient', () => {
                let addedAmount;
                beforeEach(()=>{
                    addedAmount=80;
                    transaction.update({senderWallet , recepient:nextRecepient , amount:addedAmount})
                })
                it('add the amount to the existing recepient',()=>{
                    expect(transaction.outputMap[nextRecepient]).toEqual(nextAmount+addedAmount);
                })
                it('should subtraxt the amount from the ecepient walllet',()=>{
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderAmount-nextAmount-addedAmount);
                })
            })
            
        })
        describe('amount is invalid',()=>{
            it('throws error object',()=>{
                expect(()=>transaction.update({senderWallet ,recepient:'next-recepient' ,amount:999999})).toThrow('amount exceedes balance');
            })
        })


       })
    
    describe('reward transaction', () => {
        let rewardTransaction,miningWallet;
        beforeEach(()=>{
            miningWallet=new Wallet();
            rewardTransaction=Transaction.rewardTransaction({miningWallet});
        })
        it('creates a transaction with the reward input',()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        })
        it('creates a transaction with th reward',()=>{
            expect(rewardTransaction.outputMap[miningWallet.publicKey]).toEqual(MINING_REWARD);
        })
        
    })
    
    
    
})
