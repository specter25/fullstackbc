
import React ,{Component} from 'react';

const Transaction=({transaction})=>{

    const {input ,outputMap}=transaction
    const recepients=Object.keys(outputMap);

    return(
        <div className="Transaction">
            <div>
                From:{`${input.address.substring(0,20)}....`} | Balance:{input.amount}
            </div>
        {
            recepients.map(recepient=>{
                return(
                    <div key={recepient}>
                        To:{`${recepient.substring(0,20)}....`}
                    </div>
                )
            })
        }
        </div>
    )
}

export default Transaction;