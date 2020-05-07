import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { Paragraph1 } from 'baseui/typography'
import { intl } from '../../util/intl/intl'
import notFound from "../../resources/notfound.svg"

const NotFound = (props: RouteComponentProps<any>) => (
    <Block display="flex" justifyContent="center" alignContent="center" marginTop={theme.sizing.scale2400}>
        <Paragraph1>{intl.pageNotFound} - {props.location.pathname}</Paragraph1>
        <img src={notFound} alt={intl.pageNotFound} style={{ maxWidth: "65%" }} />
    </Block>
)

export default NotFound