import { css } from "@emotion/css"
import { BodyShort, Heading, Button } from "@navikt/ds-react"
import moment from "moment"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { editTeam, getProductArea, getResourceById, getTeam, mapProductTeamToFormValue } from "../api"
import { useClusters } from "../api/clusterApi"
import { getContactAddressesByTeamId } from "../api/ContactAddressApi"
import { getProcessesForTeam } from "../api/integrationApi"
import { AuditName } from "../components/AuditName"
import DescriptionSection from "../components/team/DescriptionSection"
import { ErrorMessageWithLink } from "../components/ErrorMessageWithLink"
import { Markdown } from "../components/Markdown"
import PageTitle from "../components/PageTitle"
import StatusField from "../components/StatusField"
import { ContactAddress, Process, ProductArea, ProductTeam, ProductTeamFormValues, Resource, ResourceType } from "../constants"
import { ampli } from "../services/Amplitude"
import { user } from "../services/User"
import { intl } from "../util/intl/intl"
import ShortSummarySection from "../components/team/ShortSummarySection"
import LocationSection from "../components/team/LocationSection"
import Divider from "../components/Divider"
import Members from "../components/team/Members"
import { processLink } from "../util/config"
import { EditFilled } from "@navikt/ds-icons"
import SvgEmailFilled from "@navikt/ds-icons/esm/EmailFilled"
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled"
import { theme } from "../util/theme"


export type PathParams = { id: string }

const TeamPage = () => {
    const params = useParams<PathParams>()
    const [loading, setLoading] = useState<boolean>(false)
    const [team, setTeam] = useState<ProductTeam>()
    const [productArea, setProductArea] = useState<ProductArea>()
    const [processes, setProcesses] = useState<Process[]>([])
    const [errorMessage, setErrorMessage] = useState<string>()
    const clusters = useClusters(team?.clusterIds)
    const [contactAddresses, setContactAddresses] = useState<ContactAddress[]>()
    const [contactPersonResource, setContactPersonResource] = useState<Resource>()
    const [teamOwnerResource, setTeamOwnerResource] = useState<Resource>()
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [showTable, setShowTable] = useState<boolean>(false)
    
    let getExternalLength = () => team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0

    const handleSubmit = async (values: ProductTeamFormValues) => {
        const editResponse = await editTeam(values)
        if (editResponse.id) {
          await updateTeam(editResponse)
          setShowEditModal(false)
          setErrorMessage('')
        } else {
          setErrorMessage(editResponse)
        }
    }

    const updateTeam = async (teamUpdate: ProductTeam) => {
        setTeam(teamUpdate)
    
        if (user.isMemberOf(teamUpdate)) setContactAddresses(teamUpdate.contactAddresses)
    
        if (teamUpdate.productAreaId) {
          const productAreaResponse = await getProductArea(teamUpdate.productAreaId)
          setProductArea(productAreaResponse)
        } else {
          setProductArea(undefined)
        }
    }

    useEffect(() => {
        ;(async () => {
          if (team) {
            if (team.contactPersonIdent) {
              const contactPersonRes = await getResourceById(team.contactPersonIdent)
              setContactPersonResource(contactPersonRes)
            } else {
              setContactPersonResource(undefined)
            }
            if (team.teamOwnerIdent) {
              setTeamOwnerResource(await getResourceById(team.teamOwnerIdent))
            } else {
              setTeamOwnerResource(undefined)
            }
          }
        })()
      }, [team, loading, showEditModal])

    useEffect(() => {;(async () => {
          if (params.id) {
            setLoading(true)
            try {
              const teamResponse = await getTeam(params.id)
              ampli.logEvent('teamkat_view_team', { team: teamResponse.name })
              await updateTeam(teamResponse)
              getProcessesForTeam(params.id).then(setProcesses)
            } catch (err) {
              let errorMessage = 'Failed to do something exceptional'
              if (err instanceof Error) {
                errorMessage = err.message
              }
              console.log(errorMessage)
            }
            setLoading(false)
          }
        })()
      }, [params])

    useEffect(() => {
        if (team && user.isMemberOf(team) && contactAddresses?.length) getContactAddressesByTeamId(team.id).then(setContactAddresses)
        else setContactAddresses([])
    }, [team?.contactAddresses])

    return (
        <div>
            {!loading && !team && <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />}

            {team && (
              <>
                <div className={css`display: flex; justify-content: space-between; align-items: baseline;`}>
                  <PageTitle title={team.name} />
                  {team.changeStamp && (
                      <div className={css`margin-top: 0.5rem;`}>
                        <BodyShort size="small" >
                          <b>Sist endret av :</b> <AuditName name={team.changeStamp.lastModifiedBy} /> - {moment(team.changeStamp?.lastModifiedDate).format('lll')}
                        </BodyShort>
                      </div>
                  )}
                </div>

                <div className={css`display: flex; justify-content: space-between; margin-top: 2rem;`}>
                  <StatusField status={team.status} />
                  
                  <div className={css`display: flex;`}>
                      {/* {user.isAdmin() && <AuditButton id={team.id} marginRight />} -- Venter til adminviews er på plass */}

                      {user.canWrite() && (
                        <Button variant="secondary" size="medium" icon={<EditFilled aria-hidden />} onClick={() => setShowEditModal(true)} className={css`margin-right: 1rem;`}>
                          {intl.edit}
                        </Button>
                      )}
                      <Button variant="secondary" size="medium" icon={<SvgEmailFilled aria-hidden />} className={css`margin-right: 1rem;`}>Kontakt team</Button>
                      <Button variant="secondary" size="medium" icon={<SvgBellFilled aria-hidden />} >Bli varslet</Button>
                  </div>
                </div>

                <div className={css`display: grid; grid-template-columns: 0.6fr 0.4fr 0.4fr; grid-column-gap: 1rem; margin-top: 2rem;`}>
                    <DescriptionSection text={<Markdown source={team.description} />}/>
                    <ShortSummarySection 
                        team={team}
                        productArea={productArea}
                        clusters={clusters}
                        contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
                    />
                    <LocationSection
                        team={{...team, contactPersonResource: contactPersonResource}}
                        productArea={productArea}
                        contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
                    />
                </div>

                <Divider />

                <div>
                    <div className={css`display: flex; justify-content: space-between; margin-bottom: 2rem;`}>
                        <div className={css`display: flex; align-items: center;`}>
                          <Heading size="medium" className={css`margin-right: 2rem;  margin-top: 0px;`}>Medlemmer ({team.members.length > 0 ? team.members.length : '0'})</Heading>
                          <Heading size="small" className={css`margin-top: 0px; align-self: center;`}>
                            Eksterne {getExternalLength()} ({getExternalLength() > 0 ? ((getExternalLength()  / team.members.length) * 100).toFixed(0) : '0'}%)
                          </Heading>
                        </div>
                        <div className={css`display: flex;`}>
                            <Button variant="secondary" size="medium" className={css`margin-right: 1rem;`}>Eksporter medlemmer</Button>
                            <Button variant="secondary" size="medium">Tabellvisning</Button>
                        </div>
                    </div>
                    {/* {!showTable ? <MembersNew members={team.members} /> : <MemberTable members={team.members} />} -- Når medlemstabell er klar*/}
                    <Members members={team.members} />
                </div>
                <Divider />

                <div className={css`margin-bottom: 3rem;`}>
                    <span className={css`font-weight: 600; font-size: 18px; line-height: 23px;`}>Behandlinger i behandlingskatalogen</span>
                      {processes
                        .sort((a, b) => (a.purposeName + ': ' + a.name).localeCompare(b.purposeName + ': ' + b.name))
                        .map((p) => (
                          <div className={css`margin-top: 10px;`}>
                            <a href={processLink(p)}  target="_blank" rel="noopener noreferrer" className={theme.linkWithUnderline}>{p.purposeName + ': ' + p.name}</a>
                          </div>
                      ))}
                    </div>
              </>
            )}  
        </div>
    )
}

export default TeamPage