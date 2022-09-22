import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import React from "react"
import { Link } from "react-router-dom"
import { Cluster, ContactAddress, ProductArea, ProductTeam } from "../../constants"
import { intl } from "../../util/intl/intl"
import { TextWithLabel } from "../TextWithLabel"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 3px;`}></div>
)

interface ShortSummaryProps {
    team: ProductTeam
    productArea?: ProductArea
    clusters: Cluster[]
    contactAddresses?: ContactAddress[]
}

const DisplayNaisTeams = (props: {naisTeams: string[]}) => {
    if (props.naisTeams.length < 0) return <BodyShort>Ingen naisteams</BodyShort>
    return (
        <div className={css`display: flex; flex-wrap: wrap; margin-top: 1rem; margin-bottom: 1rem;`}>
            {props.naisTeams.map((n: string) => <Link to={'/tag/' + n}>{n} &nbsp;</Link>)}
        </div>
    )
}

const ShortSummarySection = (props: ShortSummaryProps) => {
    const { team, productArea, clusters, contactAddresses } = props
    const isPartOfDefaultArea = productArea?.defaultArea || false

    return (
        <div>
            <Heading size="medium" className={css`font-size: 22px; font-weight: 600;`}>Kort fortalt</Heading>
            <Divider />
            <div className={css`display: grid; grid-template-columns: 1fr;`}>
                {productArea && <TextWithLabel label="Område" text={<Link to={`/area/${productArea.id}`}>{productArea.name}</Link>} />}
                {/* {isPartOfDefaultArea && <TeamOwner teamOwner={team.teamOwnerResource} />} */}

                {!!clusters?.length && (
                    <TextWithLabel
                        label="Klynger"
                        text={clusters.map((c, i) => (
                            <React.Fragment key={c.id + i}>
                            <Link to={`/cluster/${c.id}`}>{c.name}</Link>
                            {i < clusters.length - 1 && <span>, </span>}
                            </React.Fragment>
                        ))}
                    />
                )}

                <TextWithLabel label={'Teamtype'} text={team.teamOwnershipType ? intl.getString(team.teamOwnershipType) : intl.dataIsMissing} />
                <TextWithLabel label="Team på NAIS" text={<DisplayNaisTeams naisTeams={team.naisTeams} />} />
                {/* // <BulletPointsList label="Team på NAIS" list={!team.naisTeams ? [] : team.naisTeams} />
                // <BulletPointsList label="Tagg" list={!team.tags ? [] : team.tags} baseUrl={'/tag/'} /> */}
            </div>
        </div>
    )
}

export default ShortSummarySection