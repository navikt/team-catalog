import * as React from 'react'
import { useEffect } from 'react'
import Metadata from '../components/common/Metadata'
import { Process, ProductArea, ProductAreaFormValues, ProductTeam } from '../constants'
import { RouteComponentProps } from 'react-router-dom'
import { editProductArea, getProductArea, mapProductAreaToFormValues } from '../api'
import { H4, Label1 } from 'baseui/typography'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../util'
import { getAllTeamsForProductArea } from '../api/teamApi'
import ListTeams from '../components/ProductArea/List'
import { useAwait } from '../util/hooks'
import { user } from '../services/User'
import Button from '../components/common/Button'
import { intl } from '../util/intl/intl'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import ModalProductArea from '../components/ProductArea/ModalProductArea'
import { AuditButton } from '../components/admin/audit/AuditButton'
import { ErrorMessageWithLink } from '../components/common/ErrorBlock'
import { Dashboard } from '../components/dash/Dashboard'
import { Members } from '../components/Members/Members'
import { getProcessesForProductArea } from '../api/integrationApi'

const blockProps: BlockProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
}

export type PathParams = { id: string }

const ProductAreaPage = (props: RouteComponentProps<PathParams>) => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorModal, setErrorModal] = React.useState()

  const handleSubmit = async (values: ProductAreaFormValues) => {
    try {
      const body = {...values, id: productArea?.id}
      const res = await editProductArea(body)
      if (res.id) {
        setProductArea(res)
        setShowModal(false)
      }
    } catch (error) {
      setErrorModal(error.message)
    }
  }

  useAwait(user.wait())

  useEffect(() => {
    (async () => {
      if (props.match.params.id) {
        setLoading(true)
        try {
          const res = await getProductArea(props.match.params.id)
          setProductArea(res)
          if (res) {
            setTeams((await getAllTeamsForProductArea(props.match.params.id)).content)
          }
          setProcesses(await getProcessesForProductArea(props.match.params.id))
        } catch (error) {
          console.log(error.message)
        }


        setLoading(false)
      }
    })()

  }, [props.match.params])

  return (
    <>
      {!loading && !productArea && (
        <ErrorMessageWithLink errorMessage={intl.producatAreaNotFound} href="/productarea" linkText={intl.linkToAllProductAreasText}/>
      )}

      {!loading && productArea && (
        <>
          <Block {...blockProps}>
            <Block>
              <H4>{productArea.name}</H4>
            </Block>
            <Block>
              {user.isAdmin() && <AuditButton id={productArea.id} marginRight/>}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => setShowModal(true)}>
                  {intl.edit}
                </Button>
              )}
            </Block>
          </Block>
          <Block width="100%" display='flex' justifyContent='space-between'>
            <Block width='55%'>
              <Metadata description={productArea.description} changeStamp={productArea.changeStamp} tags={productArea.tags} processes={processes}/>
            </Block>
            <Block width='45%' marginLeft={theme.sizing.scale400} maxWidth='415px'>
              <Dashboard cards productAreaId={productArea.id}/>
            </Block>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members members={productArea.members} title='Medlemmer på områdenivå' productAreaId={productArea.id}/>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ListTeams teams={teams}/>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Label1 marginBottom={theme.sizing.scale800}>Stats</Label1>
            <Dashboard charts productAreaId={productArea.id}/>
          </Block>

          <ModalProductArea
            title="Rediger området"
            isOpen={showModal}
            initialValues={mapProductAreaToFormValues(productArea)}
            submit={handleSubmit}
            onClose={() => setShowModal(false)}
            errorOnCreate={errorModal}
          />

        </>
      )}
    </>
  )
}

export default ProductAreaPage
