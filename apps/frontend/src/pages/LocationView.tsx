import { Block } from 'baseui/block'
import { H5, Label1 } from 'baseui/typography'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLocationHierarchy } from '../api/location'
import PageTitle from '../components/common/PageTitle'
import { ChartData } from '../components/dash/Chart'
import { useDash } from '../components/dash/Dashboard'
import AccordionFloors from '../components/Location/AccordionFloors'
import ChartNivo from '../components/Location/ChartNivo'
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

  const mapChartData = () => {
    if (!params.locationCode || !locationStats) return []
    const location = locationStats?.locationSummaryMap[params.locationCode]

    return [
      { day: 'Mandag', resources: location.monday.resourceCount },
      { day: 'Tirsdag', resources: location.tuesday.resourceCount },
      { day: 'Onsdag', resources: location.wednesday.resourceCount },
      { day: 'Torsdag', resources: location.thursday.resourceCount },
      { day: 'Fredag', resources: location.friday.resourceCount },
    ] 
  }

  const getLocationDisplayName = () => {
    if (!locationSection) return ''
    if (locationSection.code === params.locationCode) return locationSection.description.toLowerCase()
    else {
      return locationSection.subLocations?.find(a => a.code === params.locationCode)?.description.toLowerCase()
    }
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

      {params.locationCode && locationSection && locationStats && !loading && (
        <>
          <PageTitle title={locationSection.displayName} marginBottom="15px" />
          <TeamCounter teams={locationStats.locationSummaryMap[locationSection.code].teamCount} people={locationStats.locationSummaryMap[locationSection.code].resourceCount} />

          <Block width="100%" display="flex" justifyContent='space-between'>
            <Block width="50%" marginTop={theme.sizing.scale1200}>
              <AccordionFloors locationCode={params.locationCode} section={locationSection} locationStats={locationStats?.locationSummaryMap} />
            </Block>

            <Block width='40%' maxHeight='500px'> 
              <Label1 marginBottom='3px' marginTop="45px">Planlagt tilstedeværelse for {getLocationDisplayName()}</Label1>             
              <ChartNivo chartData={mapChartData()} />
            </Block>
          </Block>
        </>
      )}
    </>
  )
}

export default LocationView
