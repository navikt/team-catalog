import * as React from "react";
import {Block} from "baseui/block";

const ErrorBlock = (props:{errorMessage:string}) =>{
  return <Block overrides={{
    Block: {
      style: {
        textAlign: 'left',
        backgroundColor: '#FBEFEE',
        color: '#A13226'
      }
    }
  }}>
    <h5>{props.errorMessage}</h5>
  </Block>
}

export default ErrorBlock
