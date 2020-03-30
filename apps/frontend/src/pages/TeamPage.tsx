import * as React from 'react'
import Metadata from '../components/common/Metadata'
import ListMembers from '../components/Team/ListMembers'
import {ProductArea, ProductTeam, ProductTeamFormValues} from '../constants'
import {createTeam, editTeam, getTeam} from '../api/teamApi'
import {H4, Label1, Paragraph2} from 'baseui/typography'
import {Block} from 'baseui/block'
import {RouteComponentProps} from 'react-router-dom'
import {theme} from '../util'
import {getAllProductAreas, getProductArea} from "../api";
import Button from "../components/common/Button";
import ModalTeam from "../components/Team/ModalTeam";
import {Option} from "baseui/select";
import {StyledSpinnerNext} from "baseui/spinner";

export type PathParams = { id: string }

const TeamPage = (props: RouteComponentProps<PathParams>) => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [team, setTeam] = React.useState<ProductTeam>()
  const [productAreaName, setProductAreaName] = React.useState<string>('')
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])
  const [initialProductTeamFormValue, setInitialProductTeamFormValue] = React.useState<ProductTeamFormValues>();

  const handleSubmit = async (values: ProductTeamFormValues) => {
    console.log("update")
    const editResponse = await editTeam(values)
    if (editResponse.id) {
      setTeam(editResponse)
      setShowEditModal(false)
    }
  }

  const mapToOptions = (list: ProductArea[]) => {
    return list.map(po => ({id: po.id, label: po.name}))
  }

  const handleOpenModal = async () => {
    const res = await getAllProductAreas()
    if (res.content) {
      setProductAreas(mapToOptions(res.content))
      setShowEditModal(true)
    }
  }

  const refreshTeam = async () => {
      setLoading(true)
      const teamResponse = await getTeam(props.match.params.id)
      setInitialProductTeamFormValue(teamResponse as ProductTeamFormValues);
      console.log(teamResponse, "TEAM RESPONSE")
      if (teamResponse.productAreaId) {
        const productAreaResponse = await getProductArea(teamResponse.productAreaId)
        setProductAreaName(productAreaResponse.name)
      } else {
        setProductAreaName("Ingen produktområde registrert")
      }
      setTeam(teamResponse)
      setLoading(false)
  }

  React.useEffect(() => {
    (() => {
      if (props.match.params.id || showEditModal===false) {
        refreshTeam()
      }
    })()
  }, [props.match.params, showEditModal])

  return (
    <>
      {(!loading && team) ? (
        <>
          <Block>
            <H4>{team.name}</H4>
          </Block>
          <Block>
            <Button onClick={() => handleOpenModal()}>
              Rediger
            </Button>
            <Metadata
              productAreaName={productAreaName}
              description={team.description}
              slackChannel={team.slackChannel}
              naisTeams={team.naisTeams}
            />
          </Block>
          <Block marginTop="3rem">
            <Label1 marginBottom={theme.sizing.scale800}>Medlemmer av teamet</Label1>
            {team.members.length > 0 ? <ListMembers members={team.members}/> : <Paragraph2>Ingen medlemmer registrert'</Paragraph2>}
          </Block>

          <ModalTeam
            title={"Rediger team"}
            isOpen={showEditModal}
            initialValues={initialProductTeamFormValue!}
            productAreaOptions={productAreas}
            errorMessages={undefined}
            submit={handleSubmit}
            onClose={() => setShowEditModal(false)}/>
        </>
      ):(
        <StyledSpinnerNext size={theme.sizing.scale2400}/>
      )}
    </>
  )
}

export default TeamPage
