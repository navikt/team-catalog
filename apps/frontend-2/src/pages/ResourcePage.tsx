import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PathParams } from './team/TeamPage'
import { getAllMemberships, getResourceById, getResourceUnitsById, Membership } from '../api'
import { Resource, ResourceType, ResourceUnits, Status } from '../constants'
import moment from 'moment'
import { css } from '@emotion/css'
import PageTitle from '../components/PageTitle'
import { Heading, Loader } from '@navikt/ds-react'
import { UserImage } from '../components/UserImage'
import ShortSummaryResource from '../components/Resource/ShortSummaryResource'
import ResourceAffiliation from '../components/Resource/ResourceAffiliation'
import ResourceOrgAffiliation from '../components/Resource/ResourceOrgAffiliation'
import TableResource from '../components/Resource/TableResource'
import Divider from '../components/Divider'

const ResourcePage = () => {
  const params = useParams<PathParams>()
  const [resource, setResource] = useState<Resource>()
  const [unit, setUnits] = useState<ResourceUnits>()
  const [memberships, setMemberships] = useState<Membership>({ clusters: [], productAreas: [], teams: [] })
  const [isLoading, setLoading] = useState<boolean>(false)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const resource = await getResourceById(params.id)
        setResource(resource)
        const memberships = await getAllMemberships(resource.navIdent)
        setMemberships(memberships)
        setTab(hasNoMemberships(memberships) ? 1 : 0)
      } catch (e: any) {
        setResource(undefined)
        console.log('Something went wrong', e)
      }
      getResourceUnitsById(params.id)
        .then(setUnits)
        .catch((e) => console.debug(`cant find units for ${params.id}`))
      setLoading(false)
    })()
  }, [params.id])


  const filteredTeams = memberships.teams.filter((team) => team.status == Status.ACTIVE)
  const filteredClusters = memberships.clusters.filter((cluster) => cluster.status == Status.ACTIVE)
  const filteredAreas = memberships.productAreas.filter((area) => area.status == Status.ACTIVE)

  return !isLoading && resource ? (
    <>
      <div className={css`display: flex; width: 100%; align-items: center;`}>
          <div className={css`margin-right: 1rem;`}><UserImage ident={resource?.navIdent} size="100px" /></div>
          <PageTitle title={`${resource?.fullName} ${resource?.endDate && moment(resource?.endDate).isBefore(moment()) ? '(Inaktiv)' : ''}`} />
          
          {/* {resource?.resourceType === ResourceType.EXTERNAL && <div>{intl.EXTERNAL}</div>}
          {resource?.resourceType === ResourceType.OTHER && `(${intl.nonNavEmployee})`} */}
      </div>

      <div className={css`display: grid; grid-template-columns: 1fr 1fr 1fr; grid-column-gap: 3rem; margin-top: 2rem;`}>
          <ShortSummaryResource resource={resource} />
          <ResourceAffiliation 
              navIdent={resource.navIdent} 
              resource={resource} 
              teams={filteredTeams} 
              productAreas={filteredAreas} 
              clusters={filteredClusters}
          />
          <ResourceOrgAffiliation resource={resource} units={unit} />
      </div>

      <Divider />

      {!!unit?.members && unit?.members.length > 0 && (
        <div className={css`margin-top: 1rem; margin-bottom: 2rem;`}>
          <Heading size="medium">{resource.fullName} er leder for</Heading>

          <TableResource members={unit.members}  />
        </div>
      )}
    </>

  ) : (
    <Loader size="medium" />
  )
}


const hasNoMemberships = (membership: Membership) => {
  return membership.teams.length === 0 && membership.clusters.length === 0 && membership.productAreas.length === 0
}

export default ResourcePage
