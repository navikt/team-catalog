import { css } from '@emotion/css'
import { Add, Email } from '@navikt/ds-icons'
import { Button, ToggleGroup } from '@navikt/ds-react'
import React from 'react'
import { createProductArea, getAllProductAreas } from '../../api'
import { useDash } from '../../components/dash/Dashboard'
import PageTitle from '../../components/PageTitle'
import { ProductArea, ProductAreaFormValues } from '../../constants'
import { user } from '../../services/User'
import ProductAreaCardList from './ProductAreaCardList'

const ProductAreaListPage = () => {
  const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showContactAllModal, setShowContactAllModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()
  const [status, setStatus] = React.useState<string>('active')
  const dash = useDash()

  const handleSubmit = async (values: ProductAreaFormValues) => {
    const res = await createProductArea(values)
    if (res.id) {
      setProductAreaList([...productAreaList, res])
      setShowModal(false)
      setErrorMessage('')
    } else {
      setErrorMessage(res)
    }
  }
  const prefixFilters = ['område', 'produktområde']
  const sortName = (name: string) => {
    let sortable = name.toUpperCase()
    let fLen = -1
    prefixFilters.forEach((f, i) => {
      if (sortable?.indexOf(f) === 0 && f.length > fLen) fLen = f.length
    })
    if (fLen > 0) {
      sortable = sortable.substring(fLen).trim()
    }
    return sortable
  }

  React.useEffect(() => {
    ;(async () => {
      const res = await getAllProductAreas(status)
      if (res.content) setProductAreaList(res.content.sort((a1, a2) => sortName(a1.name).localeCompare(sortName(a2.name))))
    })()
  }, [status])

  console.log({ productAreaList })
  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        `}>
        <PageTitle title='Områder' />

        <div
          className={css`
            display: flex;
            align-items: end;
            flex-wrap: wrap;
          `}>
          <ToggleGroup
            onChange={(e) => setStatus(e)}
            value={status}
            size='medium'
            className={css`
              margin-right: 1rem;
            `}>
            <ToggleGroup.Item value='active'>Aktive ({dash?.productAreasCount})</ToggleGroup.Item>
            <ToggleGroup.Item value='planned'>Fremtidige ({dash?.productAreasCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value='inactive'>Inaktive ({dash?.productAreasCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          {user.canWrite() && (
            <Button
              variant='secondary'
              size='medium'
              onClick={() => setShowModal(true)}
              icon={<Add />}
              className={css`
                margin-left: 1rem;
              `}>
              Opprett nytt område
            </Button>
          )}
        </div>
      </div>
      {productAreaList.length > 0 && <ProductAreaCardList areaList={productAreaList} />}
    </React.Fragment>
  )
}

export default ProductAreaListPage
