import { Block } from 'baseui/block'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import * as React from 'react'
import { AreaType, ProductArea } from '../../../constants'
import ProductAreaCard from './ProductAreaCard'

type ProductAreaCardListProps = {
  producatAreaList: ProductArea[]
}

const ProductAreaCardList = (props: ProductAreaCardListProps) => {
  const { producatAreaList } = props

  return (
    <React.Fragment>
          <FlexGrid
            flexGridColumnCount={2}
            flexGridColumnGap="scale600"
            flexGridRowGap="scale1200"
          >
            <FlexGridItem>
              <Block display="flex" flexWrap>
                {producatAreaList.filter((p: ProductArea) => p.areaType === AreaType.PRODUCT_AREA).map(p => (
                    <ProductAreaCard title={p.name} areaType={AreaType.PRODUCT_AREA} />
                ))}
              </Block>
            </FlexGridItem>
            
            <FlexGridItem>
              <Block display="flex" flexWrap>
                {producatAreaList.filter((p: ProductArea) => p.areaType === AreaType.IT).map(p => (
                  <ProductAreaCard title={p.name} areaType={AreaType.IT} />
                ))}
              </Block>
            </FlexGridItem>

            <FlexGridItem>
            <Block display="flex" flexWrap>
              {producatAreaList.filter((p: ProductArea) => p.areaType === AreaType.PROJECT).map(p => (
                <ProductAreaCard title={p.name} areaType={AreaType.PROJECT} />
              ))}
              </Block>
            </FlexGridItem>
            
            <FlexGridItem>
              <Block display="flex" flexWrap>
                {producatAreaList.filter((p: ProductArea) => p.areaType === (AreaType.OTHER)).map(p => (
                    <ProductAreaCard title={p.name} areaType={AreaType.OTHER} /> 
                ))}
              </Block>
            </FlexGridItem>
          </FlexGrid>

    </React.Fragment>
  )
}

export default ProductAreaCardList
