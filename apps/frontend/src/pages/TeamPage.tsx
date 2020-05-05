import * as React from 'react'
import {useEffect} from 'react'
import Metadata from '../components/common/Metadata'
import ListMembers from '../components/Team/ListMembers'
import {Member, ProductArea, ProductTeam, ProductTeamFormValues} from '../constants'
import {editTeam, getTeam, mapProductTeamToFormValue} from '../api/teamApi'
import {H4, Label1, Paragraph2} from 'baseui/typography'
import {Block, BlockProps} from 'baseui/block'
import {RouteComponentProps} from 'react-router-dom'
import {theme} from '../util'
import {getAllProductAreas, getProductArea} from "../api";
import ModalTeam from "../components/Team/ModalTeam";
import {Option} from "baseui/select";
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import Button from '../components/common/Button'
import {intl} from '../util/intl/intl'
import {faEdit, faIdCard, faTable} from '@fortawesome/free-solid-svg-icons'
import {ampli} from '../services/Amplitude'

export type PathParams = { id: string }


const blockProps: BlockProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
}

const TeamPage = (props: RouteComponentProps<PathParams>) => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [team, setTeam] = React.useState<ProductTeam>()
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [table, setTable] = React.useState(false)

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const editResponse = await editTeam(values)
    if (editResponse.id) {
      setTeam(editResponse)
      assignProductAreaName(editResponse.productAreaId)
      setShowEditModal(false)
      setErrorMessage("")
    } else {
      setErrorMessage(editResponse)
    }
  }

  const mapProductAreaToOptions = (list: ProductArea[]) => {
    return list.map(po => ({ id: po.id, label: po.name }))
  }

  const handleOpenModal = async () => {
    const res = await getAllProductAreas()
    if (res.content) {
      setProductAreas(mapProductAreaToOptions(res.content))
      setShowEditModal(true)
    }
  }

  const assignProductAreaName = async (productAreaId: string) => {
    if (productAreaId) {
      const productAreaResponse = await getProductArea(productAreaId)
      setProductArea(productAreaResponse)
    } else {
      setProductArea(undefined)
    }
  }

  const sortedMemberList = (list: Member[]) => {
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }

  useAwait(user.wait())

  useEffect(() => {
    (async () => {
      if (props.match.params.id) {
        setLoading(true)
        const teamResponse = await getTeam(props.match.params.id)
        ampli.logEvent('teamkat_view_team', { team: teamResponse.name })
        if (teamResponse.productAreaId) {
          const productAreaResponse = await getProductArea(teamResponse.productAreaId)
          setProductArea(productAreaResponse)
        } else {
          setProductArea(undefined)
        }
        setTeam(teamResponse)
        setLoading(false)
      }
    })()
  }, [props.match.params])

  return (
    <>
      {!loading && team && (
        <>
          <Block {...blockProps}>
            <Block>
              <H4>{team.name}</H4>
            </Block>
            {user.canWrite() && (
              <Block>
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => handleOpenModal()}>
                  {intl.edit}
                </Button>
              </Block>
            )}
          </Block>
          <Block>
            <Metadata
              productAreaId={productArea?.id}
              productAreaName={productArea?.name || 'Ingen område registrert'}
              description={team.description}
              slackChannel={team.slackChannel}
              naisTeams={team.naisTeams}
              teamLeadQA={team.teamLeadQA}
              teamType={team.teamType}
              changeStamp={team.changeStamp}
            />
          </Block>
          <Block marginTop="3rem">
            <Block width='100%' display='flex' justifyContent='space-between'>
              <Label1 marginBottom={theme.sizing.scale800}>Medlemmer av teamet ({team.members.length})</Label1>
              <Block>
                <Button tooltip='Skift visningmodus' icon={table ? faIdCard : faTable} kind='outline' size='compact' onClick={() => setTable(!table)}>
                  {table ? 'Kort' : 'Tabell'}
                </Button>
              </Block>
            </Block>
            {team.members.length > 0 ?
              <ListMembers members={sortedMemberList(team.members)} table={table} />
              : <Paragraph2>Ingen medlemmer registrert</Paragraph2>}
          </Block>

          <ModalTeam
            title={"Rediger team"}
            isOpen={showEditModal}
            initialValues={mapProductTeamToFormValue(team)}
            productAreaOptions={productAreas}
            errorMessage={errorMessage}
            submit={handleSubmit}
            onClose={() => {
              setShowEditModal(false)
              setErrorMessage("")
            }} />
        </>
      )}
    </>
  )
}

export default TeamPage
