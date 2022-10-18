import { css } from '@emotion/css'
import { Detail, Heading, Label, LinkPanel } from '@navikt/ds-react'
import { divide } from 'lodash'
import React from 'react'
import { DashData, ProductAreaSummary2, useDash } from '../../components/dash/Dashboard'
import { AreaType, ProductArea } from '../../constants'
import teamCardIcon from '../../assets/teamCardIcon.svg'
import { Navigate, Router } from 'react-router-dom'

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

type ProductAreaCardListProps = {
  areaList: ProductArea[]
}

type cardInterface = {
  name: String
  id: String
  paInfo: ProductAreaSummary2
}

const ProductAreaCard = (pa: cardInterface) => {
  return (
    <LinkPanel href={'/area/' + pa.id} className={cardStyle}>
      <LinkPanel.Title>{pa.name}</LinkPanel.Title>
      <div
        className={css`
          display: flex;
        `}>
        <img
          src={teamCardIcon}
          width='20px'
          className={css`
            margin-right: 0.3rem;
          `}
        />
        <Label
          className={css`
            margin-right: 1.5rem;
          `}>
          {pa.paInfo.totalTeamCount} team
        </Label>

        <img
          src={teamCardIcon}
          width='20px'
          className={css`
            margin-right: 0.3rem;
          `}
        />

        <Label>{pa.paInfo.uniqueResourcesCount} personer</Label>
      </div>
    </LinkPanel>
  )
}

const productAreas = (areaList: ProductArea[], type: AreaType, dash: DashData | undefined): cardInterface[] => {
  let out: cardInterface[] = []

  const areas = areaList.filter((p: ProductArea) => p.areaType === type)

  if (dash) {
    areas.forEach((area) => {
      console.log(dash.areaSummaryMap[area.id])

      const currentAreaSummary = dash.areaSummaryMap[area.id]
      const currentPa: cardInterface = {
        name: area.name,
        paInfo: currentAreaSummary,
        id: area.id,
      }
      out.push(currentPa)
    })
  }

  return out
}

const ProductAreaCardList = (props: ProductAreaCardListProps) => {
  const { areaList } = props
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
            level='2'
            size='medium'
            className={css`
              margin-bottom: 1rem;
            `}>
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
            level='2'
            size='medium'
            className={css`
              margin-bottom: 1rem;
            `}>
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
            level='2'
            size='medium'
            className={css`
              margin-bottom: 1rem;
            `}>
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
            level='2'
            size='medium'
            className={css`
              margin-bottom: 1rem;
            `}>
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
