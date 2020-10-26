import * as React from 'react'
import ListView from '../components/common/ListView'
import {ProductArea, ProductTeam, ProductTeamFormValues} from '../constants'
import {createTeam, getAllTeams, mapProductTeamToFormValue} from '../api/teamApi'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import ModalTeam from '../components/Team/ModalTeam'
import {getAllProductAreas} from '../api'
import {Option} from 'baseui/select'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import {TeamExport} from '../components/Team/TeamExport'
import PageTitle from "../components/common/PageTitle";


const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])
  const [errorMessage, setErrorMessage] = React.useState<String>();

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const res = await createTeam(values)
    if (res.id) {
      setTeamList([...teamList, res])
      setShowModal(false)
      setErrorMessage("")
    } else {
      setErrorMessage(res)
    }
  }

  const mapToOptions = (list: ProductArea[]) => {
    return list.map(po => ({id: po.id, label: po.name}))
  }

  const handleOpenModal = async () => {
    const res = await getAllProductAreas()
    if (res.content) {
      setProductAreas(mapToOptions(res.content))
      setShowModal(true)
    }
  }

  useAwait(user.wait())

  React.useEffect(() => {
    (async () => {
      const res = await getAllTeams()
      if (res.content) {
        setTeamList(res.content)
      }
    })()
  }, [])

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Team"/>
        <Block display='flex'>
          <TeamExport/>
          {user.canWrite() && (
            <Block>
              <Button kind="outline" marginLeft size='compact' onClick={() => handleOpenModal()}>
                <FontAwesomeIcon icon={faPlusCircle}/>&nbsp;Opprett nytt team</Button>
            </Block>
          )}
        </Block>
      </Block>

      {teamList.length > 0 && (
        <ListView list={teamList} prefixFilter='team'/>
      )}

      {showModal && (
        <ModalTeam
          title="Opprett nytt team"
          isOpen={showModal}
          initialValues={mapProductTeamToFormValue()}
          productAreaOptions={productAreas}
          errorMessage={errorMessage}
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

export default TeamListPage
