import React ,{Component} from 'react';
import logo from '../assets/logo3.jpg'
import { Link } from "react-router-dom";
import ConductTransactions from "./ConductTransactions";

class App extends Component{
    state={
        walletInfo:{}
    }
    componentDidMount()
    {
        fetch(`${document.location.origin}/api/wallet-info`).then((response)=>response.json())
        .then(json=>
            {
                console.log(json);
                this.setState({walletInfo:json});
            }
        );
    }
    render(){

        const {address ,balance}=this.state.walletInfo;

        return(
            <div className="App">
                <div  >
                    <img className="logo" src={logo}></img>
                </div>
                <p></p>
                <p></p>
                <p></p>
                <div>Welcome to the blockchain...</div>

                <p></p>
                <p></p>

                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>conduct-transaction</Link></div>

                
                <p></p>
                <div className="WalletInfo center">
                    <div>Address:{ address}</div>
                    <div>balace:{balance}</div>
                </div>
            </div>
        );
    }
}

export default App;