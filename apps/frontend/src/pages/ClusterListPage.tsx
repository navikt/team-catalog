import * as React from 'react'
import {useEffect} from 'react'
import {Cluster, ClusterFormValues} from '../constants'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {user} from '../services/User'
import PageTitle from "../components/common/PageTitle";
import {createCluster, getAllClusters, mapClusterToFormValues} from '../api/clusterApi'
import ModalCluster from '../components/cluster/ModalCluster'
import {FlexGrid, FlexGridItem} from 'baseui/flex-grid'
import {ClusterCard} from '../components/cluster/ClusterCard'
import {useDash} from '../components/dash/Dashboard'


const ClusterListPage = () => {
  const [clusters, setClusters] = React.useState<Cluster[]>([])
  const dash = useDash()
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>();

  const handleSubmit = async (values: ClusterFormValues) => {
    const res = await createCluster(values)
    if (res.id) {
      setClusters([...clusters, res])
      setShowModal(false)
      setErrorMessage("")
    } else {
      setErrorMessage(res)
    }
  }

  useEffect(() => {
    (async () => {
      const res = await getAllClusters()
      if (res.content) {
        setClusters(res.content.sort((a, b) => a.name.localeCompare(b.name)))
      }
    })()
  }, [])

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Klynger"/>
        <Block display='flex'>
          {user.canWrite() && (
            <Block>
              <Button kind="outline" marginLeft size='compact' onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlusCircle}/>&nbsp;Opprett ny klynge</Button>
            </Block>
          )}
        </Block>
      </Block>

      {clusters.length > 0 && (
        <FlexGrid
          flexGridColumnCount={2}
        >
          {clusters.map(cluster =>
            <FlexGridItem key={cluster.id}>
              <ClusterCard title={cluster.name} clusterSummary={dash?.clusters.find(cl => cl.clusterId === cluster.id)}/>
            </FlexGridItem>
          )}
        </FlexGrid>
      )}

      {showModal && (
        <ModalCluster
          title="Opprett ny klynge"
          isOpen={showModal}
          initialValues={mapClusterToFormValues()}
          errorOnCreate={errorMessage}
          submit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setErrorMessage("")
          }}
        />
      )}

    </React.Fragment>
  )
}

export default ClusterListPage
