import * as React from 'react'
import Metadata from '../components/common/Metadata'
import { ProductArea } from '../constants'
import { RouteComponentProps } from 'react-router-dom'
import { getProductArea } from '../api'
import { H4 } from 'baseui/typography'
import { Block } from 'baseui/block'


const mock = {
    name: 'Produktområde Helse',
    description: 'Beskrivelse av produktområde helse'
}

export type PathParams = { id: string }

const ProductAreaView = (props: RouteComponentProps<PathParams>) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [productArea, setProductArea] = React.useState<ProductArea>()

    React.useEffect(() => {
        (async () => {
            if (props.match.params.id) {
                setLoading(true)
                const res = await getProductArea(props.match.params.id)
                setProductArea(res)
                setLoading(false)
            }
        })()

    }, [props.match.params])

    return (
        <>
            {!loading && productArea && (
                <>
                    <H4>{productArea.name}</H4>
                    <Block width="100%">
                        <Metadata description={productArea.description} />

                    </Block>
                </>
            )}
        </>
    )
}

export default ProductAreaView
