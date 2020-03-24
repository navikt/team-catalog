import * as React from 'react'
import { H4 } from 'baseui/typography'
import ListView from '../components/common/ListView'
import { useAwait } from '../util/hooks'
import { user } from '../services/User'
import { getAllProductAreas, createProductArea } from '../api'
import { ProductArea, ProductAreaFormValues } from '../constants'
import Button from '../components/common/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import ModalProductArea from '../components/ProductArea/ModalProductArea'

let initialValues = {
    name: '',
    description: ''
} as ProductAreaFormValues

const ProductAreaListPage = () => {
    const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([])
    const [showModal, setShowModal] = React.useState<boolean>(false)

    const handleSubmit = async (values: ProductAreaFormValues) => {
        console.log(values, "i submit")
        const res = await createProductArea(values)
        console.log(res, "res")
    }

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
                <H4>Produktområder</H4>
                <Block>
                    <Button kind="outline" marginLeft onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlusCircle} />&nbsp;Opprett nytt produktområde
                    </Button>
                </Block>
            </Block>

            {productAreaList.length > 0 && (
                <ListView list={productAreaList} />
            )}

            <ModalProductArea
                title="Opprett nytt produktområde"
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