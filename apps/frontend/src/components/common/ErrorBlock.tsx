import * as React from "react";
import { Block } from "baseui/block";
import { Notification } from "baseui/notification";
import RouteLink from "./RouteLink";


export const ErrorMessageWithLink = (props: { errorMessage: string, linkText: string, href: string }) => (
  <Notification
    kind="negative"
    overrides={{
      Body: { style: { width: 'auto' } },
    }}
  >
    <Block>
      {props.errorMessage}
      <Block marginTop="1rem">
        <RouteLink href={props.href}>{props.linkText}</RouteLink>
      </Block>
    </Block>
  </Notification>
)

const ErrorBlock = (props: { errorMessage: string }) => {
  return <Block overrides={{
    Block: {
      style: {
        textAlign: 'right',
        color: '#A13226'
      }
    }
  }}>
    <h5>{props.errorMessage}</h5>
  </Block>
}

export default ErrorBlock
