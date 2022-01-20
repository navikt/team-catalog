import { Block } from 'baseui/block'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import * as React from 'react'
import { AreaType, ProductArea } from '../../../constants'
import ProductAreaCard from './ProductAreaCard'
import { useDash } from '../../dash/Dashboard'
import { H5 } from 'baseui/typography'
import { intl } from '../../../util/intl/intl'
import { theme } from '../../../util'

type ProductAreaCardListProps = {
  areaList: ProductArea[]
}

const ProductAreaCardList = (props: ProductAreaCardListProps) => {
  const { areaList } = props
  const dash = useDash()

  const getCard = (p: ProductArea) => {
    const productAreasummary = dash?.areaSummaryMap[p.id]
    const type: AreaType = p.areaType || AreaType.OTHER
    return <ProductAreaCard key={p.id} productArea={p} teamSummary={productAreasummary} />
  }

  const heading = (text: string) => (
    <H5 marginTop={0} marginBottom={theme.sizing.scale600} marginLeft={theme.sizing.scale400}>
      {text}
    </H5>
  )

  return (
    <React.Fragment>
      <FlexGrid flexGridColumnCount={2} flexGridColumnGap="scale1200" flexGridRowGap="scale1200">
        <FlexGridItem>
          {heading(intl.PRODUCT_AREA_AREATYPE_DESCRIPTION)}
          <Block display="flex" flexDirection="column">
            {areaList.filter((p: ProductArea) => p.areaType === AreaType.PRODUCT_AREA).map(getCard)}
          </Block>
        </FlexGridItem>

        <FlexGridItem>
          {heading(intl.IT_AREATYPE_DESCRIPTION)}
          <Block display="flex" flexDirection="column">
            {areaList.filter((p: ProductArea) => p.areaType === AreaType.IT).map(getCard)}
          </Block>
        </FlexGridItem>

        <FlexGridItem>
          {heading(intl.PROJECT_AREATYPE_DESCRIPTION)}
          <Block display="flex" flexDirection="column">
            {areaList.filter((p: ProductArea) => p.areaType === AreaType.PROJECT).map(getCard)}
          </Block>
        </FlexGridItem>

        <FlexGridItem>
          {heading(intl.OTHER_AREATYPE_DESCRIPTION)}
          <Block display="flex" flexDirection="column">
            {areaList.filter((p: ProductArea) => p.areaType === AreaType.OTHER || !p.areaType).map(getCard)}
          </Block>
        </FlexGridItem>
      </FlexGrid>
    </React.Fragment>
  )
}

export default ProductAreaCardList
