const Wallet = require('./index');
const {verifySignature} =require('../util/index')
const Transaction =require('./transaction');
const Blockchain=require('../blockchain/index');
const {STARTING_BALANCE}=require('../config');


describe('wallet', () => {
    let wallet,logMock;
    beforeEach(()=>{
        wallet=new Wallet();
        logMock=jest.fn();
        global.console.log=logMock;
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
        describe('and a chain is passed', () => {
            it('calls`Wallet.claculaetBalance`',()=>{
                const calculateBalanceMock=jest.fn();
                const originalcalculateBalance=Wallet.calculateBalance;
                Wallet.calculateBalance=calculateBalanceMock;
                wallet.createTransaction({recepient:'foo' , amount:10 ,chain:new Blockchain().chain});
                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance=originalcalculateBalance;

            })
        })
        
        
    })
    describe('Calculate Balance', () => {
        let blockchain;
        beforeEach(()=>{
             blockchain=new Blockchain();
        })
        describe('there are no outputs for the wallet in the output map', () => {
            it('returns the `STARTING_BALANCE`' , ()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(STARTING_BALANCE)
            })
        })

        describe('there are outputs for the wallet', () => {
            let transaction1,transaction2;
            beforeEach(()=>{
                transaction1=new Wallet().createTransaction({
                    recepient:wallet.publicKey,
                    amount:50
                })
                transaction2=new Wallet().createTransaction({
                    recepient:wallet.publicKey,
                    amount:60
                })
                blockchain.addBlock({data:[transaction2,transaction1]})

            })

            it('adds the sum of all outputs till and the starting balance',()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(STARTING_BALANCE +transaction1.outputMap[wallet.publicKey]+ transaction2.outputMap[wallet.publicKey] )
            })

            describe('and the wallet has made some transaction', () => {
                let recentTransaction;
                beforeEach(()=>{
                    recentTransaction=wallet.createTransaction({recepient:'foo-recepirnt' ,amount:30});
                    blockchain.addBlock({data:[recentTransaction]})
                })

                it('returns the output amount of the recent transactions',()=>{
                    expect(Wallet.calculateBalance({
                        chain:blockchain.chain,
                        address:wallet.publicKey
                    })).toEqual(recentTransaction.outputMap[wallet.publicKey])
                })


                describe('and there are some outputs in the same as well as some blocks afetr it', () => {
                    let sameBlocktrasnaction ,nextBlockTransaction;
                    beforeEach(()=>{
                        recentTransaction=wallet.createTransaction({recepient:'later-foo-recepirnt' ,amount:60});
                        sameBlocktrasnaction=Transaction.rewardTransaction({miningWallet:wallet});
                        blockchain.addBlock({data:[recentTransaction,sameBlocktrasnaction]});
                        nextBlockTransaction=new Wallet().createTransaction({
                            recepient:wallet.publicKey,
                            amount:75
                        })
                        blockchain.addBlock({data:[nextBlockTransaction]});
                    })
                    it('it includes the output as well as the transaction reward',()=>{
                        expect(Wallet.calculateBalance({
                            chain:blockchain.chain,
                            address:wallet.publicKey
                        })).toEqual(recentTransaction.outputMap[wallet.publicKey]+
                                    sameBlocktrasnaction.outputMap[wallet.publicKey]+
                                    nextBlockTransaction.outputMap[wallet.publicKey]);
                    })
                })
                

            })
            


        })
        
        
    })
    
    
    
})
