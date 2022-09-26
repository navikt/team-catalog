import * as React from 'react'
import { useEffect } from 'react'
import { ProductTeam, ProductTeamFormValues } from '../constants'
import { createTeam, getAllTeams, mapProductTeamToFormValue } from '../api/teamApi'
import { user } from '../services/User'
import { useDash } from '../components/dash/Dashboard'
import { css } from '@emotion/css'
import PageTitle from '../components/PageTitle'
import { Button } from '@navikt/ds-react'
import { Link } from 'react-router-dom'
import ListView from '../components/team/ListView'

const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()
  const [status, setStatus] = React.useState<string>('active')

  const dash = useDash()

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
      const res = await getAllTeams(status)
      if (res.content) {
        setTeamList(res.content)
      }
    })()
  }, [status])

  return (
    <React.Fragment>
      <div className={css`display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2rem;`}>
        <PageTitle title="Team" />
        
        <div className={css`display: flex;`}>
          {/* <RadioGroup align="horizontal" name="horizontal" onChange={(e) => setStatus(e.target.value)} value={status}>
            <Radio value="active">Aktive ({dash?.teamsCount})</Radio>
            <Radio value="planned">Fremtidige ({dash?.teamsCountPlanned})</Radio>
            <Radio value="inactive">Inaktive ({dash?.teamsCountInactive})</Radio>
          </RadioGroup> */}

          {/* <Link to={'/tree'}>
            <Button icon={faProjectDiagram} kind="secondary" size="medium">
              Team graf
            </Button>
          </Link> */}

          {/* <TeamExport /> */}
          {/* <ModalContactAllTeams teams={teamList} /> */}

          {/* {user.canWrite() && (
            <Button variant="secondary" size="medium" onClick={() => setShowModal(true)} icon={<Plus}>
              Opprett nytt team
            </Button>
          )} */}
        </div>
      </div>

      {teamList.length > 0 && <ListView list={teamList} prefixFilter="team" />}

      {/* {showModal && (
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
      )} */}
    </React.Fragment>
  )
}

export default TeamListPage
