import { css } from '@emotion/css'
import { Detail, Heading, Label, LinkPanel } from '@navikt/ds-react'
import { divide } from 'lodash'
import React from 'react'
import { Navigate, Router } from 'react-router-dom'

import teamCardIcon from '../../assets/teamCardIcon.svg'
import type { DashData, ProductAreaSummary2} from '../../components/dash/Dashboard';
import { useDash } from '../../components/dash/Dashboard'
import type { ProductArea } from '../../constants';
import { AreaType } from '../../constants'

const categoryStyle = css`
  width: 50%;
  margin-bottom: 3rem;
`

const cardStyle = css`
  border-style: solid;
  border-radius: 10px;
  border-color: #005077;
  margin-bottom: 1rem;
  width: 90%;
  padding-left: 1rem;
`

type ProductAreaCardListProperties = {
  areaList: ProductArea[]
}

type cardInterface = {
  name: string
  id: string
  paInfo: ProductAreaSummary2
}

const ProductAreaCard = (pa: cardInterface) => {
  return (
    <LinkPanel className={cardStyle} href={'/area/' + pa.id}>
      <LinkPanel.Title>{pa.name}</LinkPanel.Title>
      <div
        className={css`
          display: flex;
        `}>
        <img
          className={css`
            margin-right: 0.3rem;
          `}
          src={teamCardIcon}
          width='20px'
        />
        <Label
          className={css`
            margin-right: 1.5rem;
          `}>
          {pa.paInfo.totalTeamCount} team
        </Label>

        <img
          className={css`
            margin-right: 0.3rem;
          `}
          src={teamCardIcon}
          width='20px'
        />

        <Label>{pa.paInfo.uniqueResourcesCount} personer</Label>
      </div>
    </LinkPanel>
  )
}

const productAreas = (areaList: ProductArea[], type: AreaType, dash: DashData | undefined): cardInterface[] => {
  const out: cardInterface[] = []

  const areas = areaList.filter((p: ProductArea) => p.areaType === type)

  if (dash) {
    for (const area of areas) {
      console.log(dash.areaSummaryMap[area.id])

      const currentAreaSummary = dash.areaSummaryMap[area.id]
      const currentPa: cardInterface = {
        name: area.name,
        paInfo: currentAreaSummary,
        id: area.id,
      }
      out.push(currentPa)
    }
  }

  return out
}

const ProductAreaCardList = (properties: ProductAreaCardListProperties) => {
  const { areaList } = properties
  const dash = useDash()

  const test = productAreas(areaList, AreaType.PRODUCT_AREA, dash)

  console.log(test)

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          flex-wrap: wrap;
        `}>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level='2'
            size='medium'>
            Produktområder
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
            `}>
            {productAreas(areaList, AreaType.PRODUCT_AREA, dash).map(ProductAreaCard)}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level='2'
            size='medium'>
            IT-område
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
            `}>
            {productAreas(areaList, AreaType.IT, dash).map(ProductAreaCard)}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level='2'
            size='medium'>
            Prosjekt
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
            `}>
            {productAreas(areaList, AreaType.PROJECT, dash).map(ProductAreaCard)}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level='2'
            size='medium'>
            Annet
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
            `}>
            {productAreas(areaList, AreaType.OTHER, dash).map(ProductAreaCard)}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ProductAreaCardList
