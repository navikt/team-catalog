import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import { Link } from "react-router-dom"
import { Resource, ResourceUnit, ResourceUnits } from "../../constants"
import { agressoIdDataToUrl } from "../../util/orgurls"
import { TextWithLabel } from "../TextWithLabel"
import { theme } from "../../util/theme"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 1rem;  margin-top: 0.5rem;`}></div>
)

type ResourceOrgAffiliationProps = {
    resource: Resource
    units?: ResourceUnits
}

const ResourceOrgAffiliation = (props: ResourceOrgAffiliationProps) => {
    const { resource, units } = props 

    return (
        <div>
            <Heading size="medium">Organisatorisk tilhørighet</Heading>
            <Divider />
            {!units?.units && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}

            {units && (
                <>
                    {units.units.map((u: ResourceUnit) => (
                        <div className={css`border-left: 3px solid #E6F1F8; margin-bottom: 1rem; padding-left: 1rem;`}>
                            <TextWithLabel label="Ansatt i" text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`} className={theme.linkWithUnderline}>{u.name}</Link>} />
                            <TextWithLabel
                                label="Avdeling"
                                text={<Link to={`/org/${agressoIdDataToUrl(u.parentUnit?.id || '', u.parentUnit?.niva || '')}`} className={theme.linkWithUnderline}>{u.parentUnit?.name || ''}</Link>}
                            />
                            <TextWithLabel
                                label="Leder"
                                text={<Link to={`/resource/${u.leader?.navIdent}`} className={theme.linkWithUnderline}>{u.leader?.fullName}</Link>}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}

export default ResourceOrgAffiliation