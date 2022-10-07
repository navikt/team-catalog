import * as React from 'react'
import { useEffect } from 'react'
import { ProductTeam, ProductTeamFormValues } from '../../constants'
import {
  createTeam,
  getAllTeams,
  mapProductTeamToFormValue,
} from '../../api/teamApi'
import { user } from '../../services/User'
import { useDash } from '../../components/dash/Dashboard'
import { css } from '@emotion/css'
import PageTitle from '../../components/PageTitle'
import { Button, ToggleGroup } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import ListView from '../../components/team/ListView'
import { TeamExport } from '../../components/team/TeamExport'
import { Add, Email } from '@navikt/ds-icons'

const TeamListPage = () => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showContactAllModal, setShowContactAllModal] =
    React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()
  const [status, setStatus] = React.useState<string>('active')

  const dash = useDash()
  const navigate = useNavigate()

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
      <div
        className={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        `}
      >
        <PageTitle title='Team' />

        <div
          className={css`
            display: flex;
            align-items: end;
            flex-wrap: wrap;
          `}
        >
          <ToggleGroup
            onChange={(e) => setStatus(e)}
            value={status}
            size='medium'
            className={css`
              margin-right: 1rem;
            `}
          >
            <ToggleGroup.Item value='active'>
              Aktive ({dash?.teamsCount})
            </ToggleGroup.Item>
            <ToggleGroup.Item value='planned'>
              Fremtidige ({dash?.teamsCountPlanned})
            </ToggleGroup.Item>
            <ToggleGroup.Item value='inactive'>
              Inaktive ({dash?.teamsCountInactive})
            </ToggleGroup.Item>
          </ToggleGroup>

          <Button
            variant='tertiary'
            size='medium'
            onClick={() => navigate('/tree')}
            className={css`
              margin-right: 1rem;
            `}
          >
            Team graf
          </Button>

          <TeamExport />
          {/* <ModalContactAllTeams teams={teamList} /> */}
          <Button
            icon={<Email />}
            variant='secondary'
            size='medium'
            onClick={() => setShowContactAllModal(true)}
            className={css`
              margin-left: 1rem;
            `}
          >
            Kontakt alle team
          </Button>

          {user.canWrite() && (
            <Button
              variant='secondary'
              size='medium'
              onClick={() => setShowModal(true)}
              icon={<Add />}
              className={css`
                margin-left: 1rem;
              `}
            >
              Opprett nytt team
            </Button>
          )}
        </div>
      </div>

      {teamList.length > 0 && <ListView list={teamList} prefixFilter='team' />}

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

      {/* Må hente inn modal for å kontakte alle teams også -- */}
    </React.Fragment>
  )
}

export default TeamListPage
