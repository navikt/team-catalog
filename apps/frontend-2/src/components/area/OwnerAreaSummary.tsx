import { css } from '@emotion/css'
import { Heading } from '@navikt/ds-react'
import React from 'react'
import { getResourceUnitsById } from '../../api'
import { ProductArea, Resource } from '../../constants'
import { TextWithLabel } from '../TextWithLabel'

interface OwnerAreaSummaryProps {
  productArea: ProductArea
}

const Divider = () => (
  <div
    className={css`
      height: 5px;
      background: #005077;
      margin-bottom: 3px;
      margin-top: 0.5rem;
    `}></div>
)

const ProductAreaOwnerResource = (props: { resource: Resource }): JSX.Element => {
  const [departmentInfo, setDepartmentInfo] = React.useState<string>('(loading)')
  const res = props.resource

  React.useEffect(() => {
    getResourceUnitsById(res.navIdent)
      .then((it) => {
        const newTxt: string = it?.units[0]?.parentUnit?.name ?? ''
        setDepartmentInfo('(' + newTxt + ')')
      })
      .catch((err) => {
        console.error(err.message)
        setDepartmentInfo('(fant ikke avdeling)')
      })
  }, [res.navIdent])

  return (
    <div
      className={css`
        margin-bottom: 8px;
      `}>
      <div
        className={css`
          display: inline;
        `}>
        <a href={`/resource/${res.navIdent}`}>{res.fullName}</a>
        <div
          className={css`
            margin-left: 10px;
            display: inline;
          `}>
          {departmentInfo}
        </div>
      </div>
    </div>
  )
}

const OwnerAreaSummary = (props: OwnerAreaSummaryProps) => {
  const { productArea } = props

  if (productArea.paOwnerGroup?.ownerResource != null) {
  }
  return (
    <div>
      <Heading
        size='medium'
        className={css`
          font-size: 22px;
          font-weight: 600;
        `}>
        {' '}
        Eiere
      </Heading>
      <Divider />
      <div>
        {productArea.paOwnerGroup && productArea.paOwnerGroup?.ownerResource != null ? (
          <>
            <TextWithLabel label={'Produktområde eier'} text={<ProductAreaOwnerResource resource={productArea.paOwnerGroup.ownerResource} />} />
          </>
        ) : (
          <>
            {' '}
            <TextWithLabel label='Produktområde eier' text={'Ingen eier'} />
          </>
        )}
        {productArea.paOwnerGroup && productArea.paOwnerGroup.ownerGroupMemberResourceList.length != 0 ? (
          <>
            <TextWithLabel
              marginTop='2rem'
              label={'Produktområde eiergruppe'}
              text={productArea.paOwnerGroup.ownerGroupMemberResourceList.map((it) => {
                return <ProductAreaOwnerResource resource={it} />
              })}
            />
          </>
        ) : (
          <>
            <TextWithLabel label={'Produktområde eiergruppe'} text={'Ingen eiergrupper'} />
          </>
        )}
      </div>
    </div>
  )
}

export default OwnerAreaSummary
