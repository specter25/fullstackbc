import React ,{Component} from 'react';
import Block from "./Block";
import { Link } from "react-router-dom";

class Blocks extends Component{

    state={
        blocks:[],
        paginatedId:1,
        blocksLength:0
    };
    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks/length`).then((response)=>response.json())
        .then(json=>
            {

                this.setState({blocksLength :json});
            }
        );

        this.fetchPaginatedBlocks(this.state.paginatedId)();
        
    }
    fetchPaginatedBlocks=(paginatedId)=>()=>{
        fetch(`${document.location.origin}/api/blocks/${paginatedId}`).then((response)=>response.json())
        .then(json=>
            {
                console.log(json);
                this.setState({blocks :json});
            }
        )

    }

    render()
    {
        return(
            <div>
                <h3>blocks</h3>
                <div>
                    {
                        [...Array(Math.ceil(this.state.blocksLength/5)).keys()]
                        .map(key=>{
                            const paginatedId=key+1;
                            return(
                                    <button type="button" className="btn btn-danger" onClick={()=>this.fetchPaginatedBlocks(paginatedId)()}>{paginatedId} {' '}
                                    </button>

                            )
                        })
                    }
                </div>
                <p></p>
                <div><Link to='/' style={{color:'red'}}>Home</Link></div>
                {
                    this.state.blocks.map(block=>{
                        return(

                            <Block key={block.hash} block={block} />

                        )
                    })
                }
            </div>
        )
    }


}
export default Blocks;