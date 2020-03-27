import React ,{Component} from 'react';
import Block from "./Block";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";
import history from '../history'

const POLL_INTERVAL_MS =10000;

class TransactionPool extends Component{

    state={
        transactionPoolMap:{}
    };
    componentDidMount(){
        this.fetchPoolMapInterval = setInterval(() => {

            fetch(`${document.location.origin}/api/transaction-pool-map`).then((response)=>response.json())
            .then(json=>
                {
                    console.log(json);
                    this.setState({transactionPoolMap :json});
                }
            );
    
            
        }, POLL_INTERVAL_MS);

       


    }

    componentWillUnmount()
    {
        clearInterval(this.fetchPoolMapInterval)
    }

    fetchMineTransactions=()=>{

        fetch(`${document.location.origin}/api/mine-transactions`)
        .then((response)=>
        {
            if(response.status ===200)
            {
                alert('success');
                history.push('./blocks')
            }
            else
            {
                alert('mine-transactions unsuccessfull')
            }
        }
        
        )

    }

    render()
    {
        return(
            <div className="transaction-pool">
                <h3>Transaction</h3>
                <p></p>
                <div><Link to='/' style={{color:'red'}}>Home</Link></div>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction=>{
                        return(

                            <div key={transaction.id}>
                                <hr />
                                <Transaction  transaction={transaction} />
                            </div>
                           
                        )
                    })
                }

                <hr />
                <Button
                    bsStyle="danger"
                    onClick={this.fetchMineTransactions}
                >
                    Mine the Transactions
                </Button>
            </div>
        )
    }


}
export default TransactionPool;