import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import { Cluster, ProductArea, ProductTeam, Resource } from "../../constants"
import CardTeam from "./CardTeam"
import CardArea from "./CardArea"
import CardCluster from "./CardCluster"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 1rem;  margin-top: 0.5rem;`}></div>
)

type ResourceAffiliationProps = {
    resource: Resource
    teams: ProductTeam[]
    productAreas: ProductArea[]
    clusters: Cluster[]
    navIdent: string
}

const ResourceAffiliation = (props: ResourceAffiliationProps) => {
    const { resource, teams, productAreas, clusters, navIdent } = props 

    return (
        <div>
            <Heading size="medium">Knytning til team og områder</Heading>
            <Divider />
            {teams.map((t: ProductTeam) => <CardTeam team={t} navIdent={navIdent} />)}
            {productAreas.map((p: ProductArea) => <CardArea area={p} navIdent={navIdent} />)}
            {clusters.map((c: Cluster) => <CardCluster cluster={c} navIdent={navIdent} />)}
        </div>
    )
}

export default ResourceAffiliation