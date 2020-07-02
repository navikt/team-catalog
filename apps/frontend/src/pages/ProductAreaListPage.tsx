import * as React from 'react'
import {H4} from 'baseui/typography'
import ListView from '../components/common/ListView'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import {createProductArea, getAllProductAreas} from '../api'
import {ProductArea, ProductAreaFormValues} from '../constants'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import ModalProductArea from '../components/ProductArea/ModalProductArea'

let initialValues = {
  name: '',
  description: '',
  tags: [],
  members: []
} as ProductAreaFormValues

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
        <H4>Områder</H4>
        {user.canWrite() && (
          <Block>
            <Button kind="outline" marginLeft onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faPlusCircle}/>&nbsp;Opprett nytt område
            </Button>
          </Block>
        )}
      </Block>

      {productAreaList.length > 0 && (
        <ListView list={productAreaList} prefixFilters={['område', 'produktområde']}/>
      )}

      <ModalProductArea
        title="Opprett nytt område"
        isOpen={showModal}
        initialValues={initialValues}
        errorOnCreate={undefined}
        submit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </React.Fragment>
  )
}

export default ProductAreaListPage
