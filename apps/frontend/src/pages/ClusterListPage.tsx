import * as React from 'react'
import ListView from '../components/common/ListView'
import {Cluster, ClusterFormValues} from '../constants'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import PageTitle from "../components/common/PageTitle";
import {createCluster, getAllClusters, mapClusterToFormValues} from '../api/clusterApi'
import ModalCluster from '../components/cluster/ModalCluster'


const ClusterListPage = () => {
  const [clusterList, setClusterList] = React.useState<Cluster[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>();

  const handleSubmit = async (values: ClusterFormValues) => {
    const res = await createCluster(values)
    if (res.id) {
      setClusterList([...clusterList, res])
      setShowModal(false)
      setErrorMessage("")
    } else {
      setErrorMessage(res)
    }
  }

  useAwait(user.wait())

  React.useEffect(() => {
    (async () => {
      const res = await getAllClusters()
      if (res.content) {
        setClusterList(res.content)
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

      {clusterList.length > 0 && (
        <ListView list={clusterList} prefixFilters={['teamklynge', 'klynge']}/>
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
