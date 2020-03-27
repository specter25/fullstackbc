import React ,{Component} from 'react';
import { FormGroup ,FormControl, Button } from "react-bootstrap";
import {Link} from 'react-router-dom';
// import { response } from 'express';
import history from "../history";

class ConductTransactions extends Component{
    state={
        recepient:'',
        amount:0
    }

    updateRecepient=(e)=>{
        this.setState({recepient :event.target.value });
        console.log(this.state)
    }

    updateamount=(e)=>{
        this.setState({amount :event.target.value })
        console.log(this.state);
    }

    conductTransaction=()=>{
        const {recepient,amount}=this.state;
        fetch(`${document.location.origin}/api/transact`,{
            method:'POST',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify({recepient,amount})
        }).then(response=>response.json())
        .then(json=>{
            alert(json.message || json.type);
            history.push('/transaction-pool')
        });
    }


    render()
    {
        return(
            <div className="ConductTransaction">
                <Link to='/'>Home</Link>
                <h3>Conduct a Transaction</h3>
                <FormGroup>
                    <FormControl
                        input='text '
                        placeholder='recepient'
                        value={this.state.recepient}
                        onChange={this.updateRecepient}
                     />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        input='number '
                        placeholder='amount'
                        value={this.state.amount}
                        onChange={this.updateamount}
                     />
                </FormGroup>
                <Button
                bsStyle="danger"
                onClick={this.conductTransaction}
                >
                Submit
                </Button>
            </div>
        )
    }
}
export default ConductTransactions;