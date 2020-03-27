import React from 'react';
import {render} from 'react-dom';
import { Router,Switch,Route } from "react-router-dom";
import history from "./history";
import App from './components/App';
import './index.css'
import Blocks from './components/Blocks';
import ConductTransactions from "./components/ConductTransactions";
import TransactionPool from './components/TransactionPoolMap';

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App} />
            <Route exact path='/blocks' component={Blocks} />
            <Route exact path='/conduct-transaction' component={ConductTransactions} />
            <Route exact path='/transaction-pool' component={TransactionPool} />
            

        </Switch>
    </Router>
    ,
    document.getElementById('root')
);
