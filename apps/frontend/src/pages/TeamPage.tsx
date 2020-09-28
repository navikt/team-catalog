import * as React from 'react'
import {useEffect} from 'react'
import Metadata from '../components/common/Metadata'
import {InfoType, Process, ProductArea, ProductTeam, ProductTeamFormValues} from '../constants'
import {editTeam, getAllProductAreas, getProductArea, getTeam, mapProductTeamToFormValue} from '../api'
import {H4} from 'baseui/typography'
import {Block, BlockProps} from 'baseui/block'
import {useParams} from 'react-router-dom'
import ModalTeam from "../components/Team/ModalTeam";
import {Option} from "baseui/select";
import {useAwait} from '../util/hooks'
import {user} from '../services/User'
import Button from '../components/common/Button'
import {intl} from '../util/intl/intl'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {ampli} from '../services/Amplitude'
import {AuditButton} from '../components/admin/audit/AuditButton'
import {ErrorMessageWithLink} from '../components/common/ErrorBlock'
import {Members} from '../components/Members/Members'
import {getInfoTypesForTeam, getProcessesForTeam} from '../api/integrationApi'
import {ProcessList} from '../components/common/ProcessList'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {theme} from '../util'
import {InfoTypeList} from '../components/common/InfoTypeList'
import {NotificationBell, NotificationType} from '../services/Notifications'

export type PathParams = {id: string}

const blockProps: BlockProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
}

const TeamPage = () => {
  const params = useParams<PathParams>()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [team, setTeam] = React.useState<ProductTeam>()
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false)
  const [productAreas, setProductAreas] = React.useState<Option[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [infoTypes, setInfoTypes] = React.useState<InfoType[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string>();

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
    return list.map(po => ({id: po.id, label: po.name}))
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

  useAwait(user.wait())

  useEffect(() => {
    (async () => {
      if (params.id) {
        setLoading(true)
        try {
          const teamResponse = await getTeam(params.id)
          setTeam(teamResponse)
          ampli.logEvent('teamkat_view_team', {team: teamResponse.name})
          if (teamResponse.productAreaId) {
            const productAreaResponse = await getProductArea(teamResponse.productAreaId)
            setProductArea(productAreaResponse)
          } else {
            setProductArea(undefined)
          }
          getProcessesForTeam(params.id).then(setProcesses)
          getInfoTypesForTeam(params.id).then(setInfoTypes)
        } catch (err) {
          console.log(err.message)
        }
        setLoading(false)
      }
    })()
  }, [params])

  return (
    <>
      {!loading && !team && (
        <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText}/>
      )}

      {team && (
        <>
          <Block {...blockProps}>
            <Block>
              <H4>{team.name}</H4>
            </Block>
            <Block display='flex'>
              <NotificationBell targetId={team.id} type={NotificationType.TEAM}/>
              {user.isAdmin() && <AuditButton id={team.id} marginRight/>}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => handleOpenModal()}>
                  {intl.edit}
                </Button>
              )}
            </Block>
          </Block>
          <Block>
            <Metadata
              productAreaId={productArea?.id}
              productAreaName={productArea?.name || 'Ingen område registrert'}
              description={team.description}
              slackChannel={team.slackChannel}
              naisTeams={team.naisTeams}
              qaTime={team.qaTime}
              teamType={team.teamType}
              changeStamp={team.changeStamp}
              tags={team.tags}
              locations={team.locations}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members
              members={team.members.sort((a,b)=>(a.resource.fullName || '').localeCompare(b.resource.fullName || ''))}
              title='Medlemmer'
              teamId={team.id}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ProcessList processes={processes} parentType={ObjectType.Team}/>
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <InfoTypeList infoTypes={infoTypes} parentType={ObjectType.ProductArea}/>
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
            }}/>
        </>
      )}
    </>
  )
}

export default TeamPage
