import * as React from 'react'
import {useEffect} from 'react'
import Metadata from '../components/common/Metadata'
import {Cluster, ClusterFormValues, ProductArea, ProductTeam} from '../constants'
import {useParams} from 'react-router-dom'
import {getAllTeamsForCluster, getProductArea} from '../api'
import {Block, BlockProps} from 'baseui/block'
import {theme} from '../util'
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
import {Dashboard} from '../components/dash/Dashboard'
import {Label1} from 'baseui/typography'
import {Members} from '../components/Members/Members'
import {CardList} from '../components/ProductArea/List'

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
  const [productArea, setProductArea] = React.useState<ProductArea>()
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

  useEffect(() => {
    (async () => {
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
              <Metadata description={cluster.description} changeStamp={cluster.changeStamp} tags={cluster.tags} productArea={productArea}/>
            </Block>
            <Block width='45%' marginLeft={theme.sizing.scale400} maxWidth='415px'>
              <Dashboard cards clusterId={cluster.id}/>
            </Block>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <CardList teams={teams} clusterId={cluster.id}/>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members
              members={cluster
              .members
              .sort((a, b) => (a.resource.fullName || '').localeCompare(b.resource.fullName || ''))
              }
              title='Medlemmer på klyngenivå' clusterId={cluster.id}/>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Label1 marginBottom={theme.sizing.scale800}>Stats</Label1>
            <Dashboard charts clusterId={cluster.id}/>
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
