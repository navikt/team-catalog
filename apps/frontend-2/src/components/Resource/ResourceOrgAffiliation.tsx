import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'

import type { Resource, ResourceUnits } from '../../constants'

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 1rem;
      margin-top: 0.5rem;
    `}></div>
)

type ResourceOrgAffiliationProperties = {
  resource: Resource
  units?: ResourceUnits
}

const ResourceOrgAffiliation = (properties: ResourceOrgAffiliationProperties) => {
  const { units } = properties

  return (
    <div>
      <Heading size='medium'>Organisatorisk tilhørighet</Heading>
      <Divider />
      {!units?.units && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}
      {units && units.units.length > 0 && (
        <div>{/* <TextWithLabel label='Ansatt i' text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</Link>} /> */}</div>
      )}
    </div>
  )
}

export default ResourceOrgAffiliation
