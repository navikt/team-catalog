import * as React from 'react'
import {useEffect} from 'react'
import Metadata from '../components/common/Metadata'
import {Cluster, ClusterFormValues, ProductTeam} from '../constants'
import {useParams} from 'react-router-dom'
import {getAllTeamsForCluster} from '../api'
import {Block, BlockProps} from 'baseui/block'
import {theme} from '../util'
import ListTeams from '../components/ProductArea/List'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import Button from '../components/common/Button'
import {intl} from '../util/intl/intl'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {AuditButton} from '../components/admin/audit/AuditButton'
import {ErrorMessageWithLink} from '../components/common/ErrorBlock'
import PageTitle from "../components/common/PageTitle";
import {editCluster, getCluster, mapClusterToFormValues} from '../api/clusterApi'
import ModalCluster from '../components/cluster/ModalCluster'

const blockProps: BlockProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
}

export type PathParams = {id: string}

const ClusterPage = () => {
  const params = useParams<PathParams>()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [cluster, setCluster] = React.useState<Cluster>()
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorModal, setErrorModal] = React.useState()

  const handleSubmit = async (values: ClusterFormValues) => {
    try {
      const body = {...values, id: cluster?.id}
      const res = await editCluster(body)
      if (res.id) {
        setCluster(res)
        setShowModal(false)
      }
    } catch (error) {
      setErrorModal(error.message)
    }
  }

  useAwait(user.wait())

  useEffect(() => {
    (async () => {
      if (params.id) {
        setLoading(true)
        try {
          const res = await getCluster(params.id)
          setCluster(res)
          if (res) {
            setTeams((await getAllTeamsForCluster(params.id)).content)
          }
        } catch (error) {
          console.log(error.message)
        }
        setLoading(false)
      }
    })()

  }, [params])

  return (
    <>
      {!loading && !cluster && (
        <ErrorMessageWithLink errorMessage={intl.productAreaNotFound} href="/area" linkText={intl.linkToAllProductAreasText}/>
      )}

      {!loading && cluster && (
        <>
          <Block {...blockProps}>
            <Block>
              <PageTitle title={cluster.name}/>
            </Block>
            <Block display='flex'>
              {user.isAdmin() && <AuditButton id={cluster.id} marginRight/>}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => setShowModal(true)}>
                  {intl.edit}
                </Button>
              )}
            </Block>
          </Block>
          <Block width="100%" display='flex' justifyContent='space-between'>
            <Block width='55%'>
              <Metadata description={cluster.description} changeStamp={cluster.changeStamp} tags={cluster.tags}/>
            </Block>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ListTeams teams={teams} clusterId={cluster.id}/>
          </Block>

          <ModalCluster
            title="Rediger klynge"
            isOpen={showModal}
            initialValues={mapClusterToFormValues(cluster)}
            submit={handleSubmit}
            onClose={() => setShowModal(false)}
            errorOnCreate={errorModal}
          />

        </>
      )}
    </>
  )
}

export default ClusterPage
