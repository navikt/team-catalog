import * as React from 'react'
import { Card, CardOverrides } from 'baseui/card'
import { Block } from 'baseui/block';
import { AreaType } from '../../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { H6 } from 'baseui/typography';
import { theme } from '../../../util';


// Bytte fargene her til på bruke de samme fra mainsearch i behandlingskatalogen
const cardBackgroundColor = (areaType: AreaType) => {
    if (areaType === AreaType.PRODUCT_AREA) return "#FECA52"
    else if (areaType === AreaType.IT) return "#9EEDFC"
    else if (areaType === AreaType.PROJECT) return "#A4EC62"
    else return "#FCFC84"
}
const cardOverrides = (areaType: AreaType) => {
    return {
        Root: {
            style: () => {
                return {
                    background: cardBackgroundColor(areaType),
                    width: '180px',
                    height: '200px',
                    padding: theme.sizing.scale500, 
                    margin: theme.sizing.scale300
                }
            }
        }
    } as CardOverrides
}

// Bare hardkodet her foreløpig, bare å sende inn props
const TeamCounter = () => (
    <Block display="flex" alignItems="center"> <FontAwesomeIcon icon={faUsers} /> &nbsp; <p>7 team</p></Block>
)

type ProductAreaCardProps = {
    title: string,
    areaType: AreaType
}

const ProductAreaCard = (props: ProductAreaCardProps) => {
    return (
        <Card overrides={cardOverrides(props.areaType)}>
            <Block height="100%">
                <Block minHeight="40%">
                    <H6 marginTop="0">{props.title}</H6>
                </Block>
                <TeamCounter />
            </Block>
        </Card>
    )
}

export default ProductAreaCard