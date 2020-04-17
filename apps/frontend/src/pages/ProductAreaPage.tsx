import * as React from 'react'
import Metadata from '../components/common/Metadata'
import {ProductArea, ProductTeam} from '../constants'
import {RouteComponentProps} from 'react-router-dom'
import {getProductArea} from '../api'
import {H4, Label1, Paragraph2} from 'baseui/typography'
import {Block} from 'baseui/block'
import {theme} from '../util'
import {getAllTeamsForProductArea} from '../api/teamApi'
import ListTeams from '../components/ProductArea/ListTeams'

export type PathParams = { id: string }

const ProductAreaPage = (props: RouteComponentProps<PathParams>) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [productArea, setProductArea] = React.useState<ProductArea>()
    const [teams, setTeams] = React.useState<ProductTeam[]>([])

    React.useEffect(() => {
        (async () => {
            if (props.match.params.id) {
                setLoading(true)
                const res = await getProductArea(props.match.params.id)
                setProductArea(res)
                console.log(res)
                if (res) {
                    setTeams((await getAllTeamsForProductArea(props.match.params.id)).content)
                }
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
                    <Block marginTop="3rem">
                        <Label1 marginBottom={theme.sizing.scale800}>Teams</Label1>
                        {teams.length > 0 ? <ListTeams teams={teams} /> : <Paragraph2>Ingen teams</Paragraph2>}
                    </Block>
                </>
            )}
        </>
    )
}

export default ProductAreaPage
