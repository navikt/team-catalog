import { css } from '@emotion/css'
import { BodyShort, Heading } from '@navikt/ds-react'
import { Link } from 'react-router-dom'
import { Resource, ResourceUnits } from '../../constants'
import { agressoIdDataToUrl } from '../../util/orgurls'
import { TextWithLabel } from '../TextWithLabel'

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 1rem;
      margin-top: 0.5rem;
    `}></div>
)

type ResourceOrgAffiliationProps = {
  resource: Resource
  units?: ResourceUnits
}

const ResourceOrgAffiliation = (props: ResourceOrgAffiliationProps) => {
  const { resource, units } = props

  return (
    <div>
      <Heading size='medium'>Organisatorisk tilhørighet</Heading>
      <Divider />
      {!units?.units && <BodyShort>Personen har ingen organisatorisk tilhørighet</BodyShort>}
      {units && units.units.length > 0 && (
        <div>
          <TextWithLabel label='Ansatt i' text={<Link to={`/org/${agressoIdDataToUrl(u.id, u.niva || '')}`}>{u.name}</Link>} />
        </div>
      )}
    </div>
  )
}

export default ResourceOrgAffiliation
