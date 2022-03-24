import * as React from 'react'
import { useEffect, useState } from 'react'
import Metadata from '../components/common/Metadata'
import { Cluster, ClusterFormValues, Process, ProductArea, ProductTeam } from '../constants'
import { useHistory, useParams } from 'react-router-dom'
import { getAllTeamsForCluster, getProductArea } from '../api'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../util'
import { user } from '../services/User'
import Button from '../components/common/Button'
import { intl } from '../util/intl/intl'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { AuditButton } from '../components/admin/audit/AuditButton'
import { ErrorMessageWithLink } from '../components/common/ErrorBlock'
import PageTitle from '../components/common/PageTitle'
import { deleteCluster, editCluster, getCluster, mapClusterToFormValues } from '../api/clusterApi'
import ModalCluster from '../components/cluster/ModalCluster'
import { Dashboard, useDash } from '../components/dash/Dashboard'
import { Label1 } from 'baseui/typography'
import { Members } from '../components/Members/Members'
import { CardList } from '../components/ProductArea/List'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { env } from '../util/env'
import { getProcessesForCluster } from '../api/integrationApi'
import { ProcessList } from '../components/common/ProcessList'
import { ObjectType } from '../components/admin/audit/AuditTypes'
import ClusterMetadata from '../components/cluster/ClusterMetadata'

const blockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export type PathParams = { id: string }

const ClusterPage = () => {
  const params = useParams<PathParams>()
  const history = useHistory()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [cluster, setCluster] = React.useState<Cluster>()
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = useState(false)
  const [errorModal, setErrorModal] = React.useState()
  const dash = useDash()

  const handleSubmit = async (values: ClusterFormValues) => {
    try {
      const body = { ...values, id: cluster?.id }
      const res = await editCluster(body)
      if (res.id) {
        setCluster(res)
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
          const res = await getCluster(params.id)
          setCluster(res)
          if (res) {
            setTeams((await getAllTeamsForCluster(params.id)).content)
          }
          getProcessesForCluster(params.id).then(setProcesses)
        } catch (error: any) {
          console.log(error.message)
        }
        setLoading(false)
      }
    })()
  }, [params])

  useEffect(() => {
    ;(async () => {
      if (cluster?.productAreaId) {
        const productAreaResponse = await getProductArea(cluster.productAreaId)
        setProductArea(productAreaResponse)
      } else {
        setProductArea(undefined)
      }
    })()
  }, [cluster?.productAreaId])

  return (
    <>
      {!loading && !cluster && <ErrorMessageWithLink errorMessage={intl.productAreaNotFound} href="/area" linkText={intl.linkToAllProductAreasText} />}

      {!loading && cluster && (
        <>
          <Block {...blockProps}>
            <Block>
              <PageTitle title={cluster.name} />
            </Block>
            <Block display="flex">
              {user.isAdmin() && <AuditButton id={cluster.id} marginRight />}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => setShowModal(true)}>
                  {intl.edit}
                </Button>
              )}
            </Block>
          </Block>
          <ClusterMetadata cluster={cluster} clusterSummaryMap={dash?.clusterSummaryMap[cluster.id]} productArea={productArea}>
            <Dashboard cards clusterId={cluster.id} />
          </ClusterMetadata>

          <Block marginTop={theme.sizing.scale2400}>
            <CardList teams={teams} clusterId={cluster.id} />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members
              members={cluster.members.sort((a, b) => (a.resource.fullName || '').localeCompare(b.resource.fullName || ''))}
              title="Medlemmer på klyngenivå"
              clusterId={cluster.id}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Label1 marginBottom={theme.sizing.scale800}>Stats</Label1>
            <Dashboard charts clusterId={cluster.id} />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ProcessList processes={processes} parentType={ObjectType.Cluster} />
          </Block>

          <ModalCluster
            title="Rediger klynge"
            isOpen={showModal}
            initialValues={mapClusterToFormValues(cluster)}
            submit={handleSubmit}
            onClose={() => setShowModal(false)}
            errorOnCreate={errorModal}
          />

          <Modal onClose={() => setShowDelete(false)} isOpen={showDelete} animate unstable_ModalBackdropScroll size="default">
            <ModalHeader>Slett klynge</ModalHeader>
            <ModalBody>
              {teams.length ? (
                <>
                  <p>Kan ikke slette </p>
                  <p>Det er knyttet til {teams.length} team</p>
                </>
              ) : (
                <p>Bekreft sletting av klynge: {cluster.name}</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Block display="flex" justifyContent="flex-end">
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button kind="secondary" onClick={() => setShowDelete(false)}>
                  Avbryt
                </Button>
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button onClick={() => deleteCluster(cluster?.id).then(() => history.push('/cluster'))} disabled={!!teams.length}>
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

export default ClusterPage
