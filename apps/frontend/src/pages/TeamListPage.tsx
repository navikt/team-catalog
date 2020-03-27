import * as React from 'react'
import {H4} from 'baseui/typography'
import ListView from '../components/common/ListView'
import {ProductTeam, ProductTeamFormValues, ProductArea} from '../constants'
import {getAllTeams, createTeam} from '../api/teamApi'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import ModalTeam from '../components/Team/ModalTeam'
import {getAllProductAreas} from '../api'
import {Option} from 'baseui/select'
import {useAwait} from '../util/hooks'
import {user} from '../services/User'

let initialValues = {
  name: '',
  productAreaId: '',
  slackChannel: '',
  description: '',
  naisTeams: [],
  members: []
} as ProductTeamFormValues

const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const res = await createTeam(values)
    if (res.id) {
      setTeamList([...teamList, res])
      setShowModal(false)
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
        setTeamList(res.content as ProductTeam[])
      }
    })()
  }, []);

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <H4>Teams</H4>
        {user.canWrite() && (
          <Block>
            <Button kind="outline" marginLeft onClick={() => handleOpenModal()}>
              <FontAwesomeIcon icon={faPlusCircle}/>&nbsp;Opprett nytt team
            </Button>
          </Block>
        )}
      </Block>

      {teamList.length > 0 && (
        <ListView list={teamList}/>
      )}

      {showModal && (
        <ModalTeam
          title="Opprett nytt team"
          isOpen={showModal}
          initialValues={initialValues}
          productAreaOptions={productAreas}
          errorOnCreate={undefined}
          submit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

    </React.Fragment>
  )
}

export default TeamListPage
