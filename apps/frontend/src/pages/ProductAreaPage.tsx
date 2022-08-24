import * as React from 'react'
import { useEffect, useState } from 'react'
import { Process, ProductArea, ProductAreaFormValues, ProductTeam, Status } from '../constants'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteArea, editProductArea, getAllTeamsForProductArea, getProductArea, mapProductAreaToFormValues } from '../api'
import { LabelLarge } from 'baseui/typography'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../util'
import { CardList } from '../components/ProductArea/List'
import { user } from '../services/User'
import Button from '../components/common/Button'
import { intl } from '../util/intl/intl'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import ModalProductArea from '../components/ProductArea/ModalProductArea'
import { AuditButton } from '../components/admin/audit/AuditButton'
import { ErrorMessageWithLink } from '../components/common/ErrorBlock'
import { Dashboard, useDash } from '../components/dash/Dashboard'
import { Members } from '../components/Members/Members'
import { getProcessesForProductArea } from '../api/integrationApi'
import { ProcessList } from '../components/common/ProcessList'
import { ObjectType } from '../components/admin/audit/AuditTypes'
import { NotificationBell, NotificationType } from '../services/Notifications'
import PageTitle from '../components/common/PageTitle'
import { useClustersForProductArea } from '../api/clusterApi'
import { env } from '../util/env'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import ProductAreaMetadata from '../components/ProductArea/ProductAreaMetadata'

const blockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export type PathParams = { id: string }

const ProductAreaPage = () => {
  const params = useParams<PathParams>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const clusters = useClustersForProductArea(productArea?.id)
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = useState(false)
  const [errorModal, setErrorModal] = React.useState()
  const dash = useDash()

  const handleSubmit = async (values: ProductAreaFormValues) => {
    try {
      const body = { ...values, id: productArea?.id }
      const res = await editProductArea(body)
      if (res.id) {
        setProductArea(res)
        setShowModal(false)
      }
    } catch (error: any) {
      setErrorModal(error.message)
    }
  }
  useEffect(() => {
    ;(async () => {
      if (params.id) {
        setLoading(true)
        try {
          const res = await getProductArea(params.id)
          setProductArea(res)
          if (res) {
            setTeams((await getAllTeamsForProductArea(params.id)).content.filter((team) => team.status === Status.ACTIVE))
          }
          getProcessesForProductArea(params.id).then(setProcesses)
        } catch (error: any) {
          console.log(error.message)
        }

        setLoading(false)
      }
    })()
  }, [params])
  return (
    <>
      {!loading && !productArea && <ErrorMessageWithLink errorMessage={intl.productAreaNotFound} href="/area" linkText={intl.linkToAllProductAreasText} />}

      {!loading && productArea && (
        <>
          <Block {...blockProps}>
            <Block>
              <PageTitle title={productArea.name} />
            </Block>
            <Block display="flex">
              <NotificationBell targetId={productArea.id} type={NotificationType.PA} />
              {user.isAdmin() && <AuditButton id={productArea.id} marginRight />}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => setShowModal(true)}>
                  {intl.edit}
                </Button>
              )}
            </Block>
          </Block>

          <ProductAreaMetadata productArea={productArea} productAreaMap={dash?.areaSummaryMap[productArea.id]}>
            <Dashboard cards productAreaId={productArea.id} />
          </ProductAreaMetadata>

          <Block marginTop={theme.sizing.scale2400}>
            <CardList teams={teams} clusters={clusters} productAreaId={productArea.id} />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members
              members={productArea.members.sort((a, b) => (a.resource.fullName || '').localeCompare(b.resource.fullName || ''))}
              title="Medlemmer på områdenivå"
              productAreaId={productArea.id}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <LabelLarge marginBottom={theme.sizing.scale800}>Stats</LabelLarge>
            <Dashboard charts productAreaId={productArea.id} />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ProcessList processes={processes} parentType={ObjectType.ProductArea} />
          </Block>

          <ModalProductArea
            title="Rediger området"
            isOpen={showModal}
            initialValues={mapProductAreaToFormValues(productArea)}
            submit={handleSubmit}
            onClose={() => setShowModal(false)}
            errorOnCreate={errorModal}
          />

          <Modal onClose={() => setShowDelete(false)} isOpen={showDelete} animate size="default">
            <ModalHeader>Slett område</ModalHeader>
            <ModalBody>
              {clusters.length || teams.length ? (
                <>
                  <p>Kan ikke slette </p>
                  {!!clusters.length && <p>Det er knyttet til {clusters.length} klynger</p>}
                  {!!teams.length && <p>Det er knyttet til {teams.length} team</p>}
                </>
              ) : (
                <p>Bekreft sletting av område: {productArea.name}</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Block display="flex" justifyContent="flex-end">
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button kind="secondary" onClick={() => setShowDelete(false)}>
                  Avbryt
                </Button>
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button onClick={() => deleteArea(productArea?.id).then(() => navigate('/area'))} disabled={!!clusters.length || !!teams.length}>
                  Slett
                </Button>
              </Block>
            </ModalFooter>
          </Modal>
        </>
      )}
    </>
  )
}

export default ProductAreaPage
