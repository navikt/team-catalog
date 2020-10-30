import * as React from 'react'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import {createProductArea, getAllProductAreas, mapProductAreaToFormValues} from '../api'
import {ProductArea, ProductAreaFormValues} from '../constants'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import ModalProductArea from '../components/ProductArea/ModalProductArea'
import ProductAreaCardList from '../components/ProductArea/Temp'
import PageTitle from "../components/common/PageTitle";


const ProductAreaListPage = () => {
  const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)

  const handleSubmit = async (values: ProductAreaFormValues) => {
    const res = await createProductArea(values)
    if (res.id) {
      setProductAreaList([...productAreaList, res])
      setShowModal(false)
    }
  }

  useAwait(user.wait())

  React.useEffect(() => {
    (async () => {
      const res = await getAllProductAreas()
      if (res.content)
        setProductAreaList(res.content)
    })()
  }, []);

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Områder"/>
        {user.canWrite() && (
          <Block>
            <Button kind="outline" marginLeft onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faPlusCircle}/>&nbsp;Opprett nytt område
            </Button>
          </Block>
        )}
      </Block>


      {productAreaList.length > 0 && (
        <ProductAreaCardList areaList={productAreaList} />
      )}

      <ModalProductArea
        title="Opprett nytt område"
        isOpen={showModal}
        initialValues={mapProductAreaToFormValues()}
        errorOnCreate={undefined}
        submit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </React.Fragment>
  )
}

export default ProductAreaListPage
