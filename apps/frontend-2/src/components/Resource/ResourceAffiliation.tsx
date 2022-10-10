import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import { Cluster, ProductArea, ProductTeam, Resource } from "../../constants"
import CardTeam from "./CardTeam"
import CardArea from "./CardArea"
import CardCluster from "./CardCluster"
import { getResourceUnitsById } from "../../api"
import React from "react"
import ownershipImage from '../../assets/ownershipImage.svg'
import { TextWithLabel } from "../TextWithLabel"

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
    const [departmentInfo, setDepartmentInfo] = React.useState<string | undefined>()

    React.useEffect(() => {
        getResourceUnitsById(resource.navIdent)
          .then((it) => {
            const newTxt: string = it?.units[0]?.parentUnit?.name ?? ''
            setDepartmentInfo(newTxt)
          })
          .catch((err) => {
            console.error(err.message)
            setDepartmentInfo(undefined)
          })
      }, [resource.navIdent])

    return (
        <div>
            <Heading size="medium">Knytning til team og områder</Heading>
            <Divider />
            {departmentInfo && (
                <div className={css`display: flex; margin-bottom: 2rem;`}>
                    <img src={ownershipImage} alt="Eier for logo" className={css`margin-right: 1rem;`} />
                    <TextWithLabel label="Eier for" text={departmentInfo} />
                </div>
            )}
            
            {teams.map((t: ProductTeam) => <CardTeam team={t} navIdent={navIdent} />)}
            {productAreas.map((p: ProductArea) => <CardArea area={p} navIdent={navIdent} />)}
            {clusters.map((c: Cluster) => <CardCluster cluster={c} navIdent={navIdent} />)}
        </div>
    )
}

export default ResourceAffiliation