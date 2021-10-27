import * as React from 'react'
import { useEffect } from 'react'
import ListView from '../components/common/ListView'
import { ProductTeam, ProductTeamFormValues } from '../constants'
import { createTeam, getAllTeams, mapProductTeamToFormValue } from '../api/teamApi'
import { Block } from 'baseui/block'
import Button from '../components/common/Button'
import { faPlusCircle, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import ModalTeam from '../components/Team/ModalTeam'
import { user } from '../services/User'
import { TeamExport } from '../components/Team/TeamExport'
import PageTitle from '../components/common/PageTitle'
import RouteLink from '../components/common/RouteLink'
import ModalContactAllTeams from '../components/Team/ModalContactAllTeams'

const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const res = await createTeam(values)
    if (res.id) {
      setTeamList([...teamList, res])
      setShowModal(false)
      setErrorMessage('')
    } else {
      setErrorMessage(res)
    }
  }

  useEffect(() => {
    ;(async () => {
      const res = await getAllTeams()
      if (res.content) {
        setTeamList(res.content)
      }
    })()
  }, [])

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Team" />
        <Block display="flex">
          <RouteLink href={'/tree'}>
            <Button icon={faProjectDiagram} kind="tertiary" size="compact" marginRight>
              Team graf
            </Button>
          </RouteLink>
          <TeamExport />
          <ModalContactAllTeams teams={teamList} />
          {user.canWrite() && (
            <Button kind="outline" marginLeft size="compact" onClick={() => setShowModal(true)} icon={faPlusCircle}>
              Opprett nytt team
            </Button>
          )}
        </Block>
      </Block>

      {teamList.length > 0 && <ListView list={teamList} prefixFilter="team" />}

      {showModal && (
        <ModalTeam
          title="Opprett nytt team"
          isOpen={showModal}
          initialValues={mapProductTeamToFormValue()}
          errorMessage={errorMessage}
          submit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setErrorMessage('')
          }}
        />
      )}
    </React.Fragment>
  )
}

export default TeamListPage
