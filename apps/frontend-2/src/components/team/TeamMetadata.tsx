import { css } from "@emotion/css"
import { BodyShort, Label, Loader } from "@navikt/ds-react"
import { ReactNode } from "react"
import { Cluster, ContactAddress, ProductArea, ProductTeam } from "../../constants"
import { intl } from "../../util/intl/intl"

interface TeamMetadataProps {
    team: ProductTeam
    productArea?: ProductArea
    clusters: Cluster[]
    children?: ReactNode
    contactAddresses?: ContactAddress[]
}

function Loading({ t }: { t: boolean }) {
    return t ? (
      <div className={css`display: inline-block;`}>
        <Loader size="medium" />
      </div>
    ) : null
}

// function BulletPointsList(props: { label: string; baseUrl?: string; list?: string[]; children?: ReactNode[] }) {
//     const len = (props.list || props.children || []).length
//     return (
//       <div>
//         <Label size="medium">{props.label}</Label>
//         <div>{len > 0 ? <DotTags items={props.list} children={props.children} baseUrl={props.baseUrl} /> : <BodyShort size="medium">{intl.dataIsMissing}</BodyShort>}</div>
//       </div>
//     )
// }