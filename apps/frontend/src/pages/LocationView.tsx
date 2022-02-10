import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLocationHierarchy } from '../api/location'
import PageTitle from '../components/common/PageTitle'
import { useDash } from '../components/dash/Dashboard'
import AccordionFloors from '../components/Location/AccordionFloors'
import LocationBuildingView from '../components/Location/LocationBuildingView'
import { TeamCounter } from '../components/ProductArea/View/ProductAreaCard'
import { LocationHierarchy, LocationSimple } from '../constants'
import { theme } from '../util'

const LocationView = () => {
  const params = useParams<{ locationCode?: string }>()
  const [locationBuilding, setLocationBuilding] = useState<LocationSimple>()
  const [locationSection, setLocationSection] = useState<LocationSimple>()
  const [loading, setLoading] = useState<Boolean>(true)

  const locationStats = useDash()

  const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
    return locationHierarchy[0].subLocations.find((sl) => code.includes(sl.code))
  }

  useEffect(() => {
    ;(async () => {
      if (!params.locationCode || params.locationCode === 'FA1') {
        setLoading(true)
        const res = await getLocationHierarchy()
        if (res) {
          setLocationBuilding(res[0])
          setLocationSection(undefined)
        }
        setLoading(false)
      } else {
        if (params.locationCode?.includes(locationSection ? locationSection.code : ' ')) {
          setLoading(false)
        } else {
          setLoading(true)
          const res = await getLocationHierarchy()
          if (res && params.locationCode) {
            setLocationSection(findSectionByCode(res, params.locationCode))
            setLocationBuilding(undefined)
          }
          setLoading(false)
        }
      }
    })()
  }, [params.locationCode])

  return (
    <>
      {!loading && locationBuilding && locationStats && (
        <>
          <PageTitle title={locationBuilding.displayName} marginBottom="15px" />
          <TeamCounter teams={locationStats.locationSummaryMap[locationBuilding.code].teamCount} people={locationStats.locationSummaryMap[locationBuilding.code].resourceCount} />
          <LocationBuildingView stats={locationStats?.locationSummaryMap} sectionList={locationBuilding.subLocations ? locationBuilding.subLocations : []} />
        </>
      )}

      {locationSection && locationStats && !loading && (
        <>
          <PageTitle title={locationSection.displayName} marginBottom="15px" />
          <TeamCounter teams={locationStats.locationSummaryMap[locationSection.code].teamCount} people={locationStats.locationSummaryMap[locationSection.code].resourceCount} />

          <Block width="50%" marginTop={theme.sizing.scale1200}>
            <AccordionFloors locationCode={params.locationCode ? params.locationCode : ''} section={locationSection} locationStats={locationStats?.locationSummaryMap} />
          </Block>
        </>
      )}
    </>
  )
}

export default LocationView
