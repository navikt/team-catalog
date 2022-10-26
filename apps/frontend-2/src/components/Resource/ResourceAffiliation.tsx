import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"

import type { Cluster, ProductArea, ProductTeam, Resource } from "../../constants"
import CardArea from "./CardArea"
import CardCluster from "./CardCluster"
import CardTeam from "./CardTeam"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 1rem;  margin-top: 0.5rem;`}></div>
)

type ResourceAffiliationProperties = {
    resource: Resource
    teams: ProductTeam[]
    productAreas: ProductArea[]
    clusters: Cluster[]
    navIdent: string
}

const ResourceAffiliation = (properties: ResourceAffiliationProperties) => {
    const { resource, teams, productAreas, clusters, navIdent } = properties 

    return (
        <div>
            <Heading size="medium">Knytning til team og områder</Heading>
            <Divider />
            {teams.map((t: ProductTeam) => <CardTeam navIdent={navIdent} team={t} />)}
            {productAreas.map((p: ProductArea) => <CardArea area={p} navIdent={navIdent} />)}
            {clusters.map((c: Cluster) => <CardCluster cluster={c} navIdent={navIdent} />)}
        </div>
    )
}

export default ResourceAffiliation