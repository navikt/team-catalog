import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLocationHierarchy } from '../api/location'
import PageTitle from '../components/common/PageTitle'
import { useDash } from '../components/dash/Dashboard'
import AccordionFloors from '../components/Location/AccordionFloors'
import { TeamCounter } from '../components/ProductArea/View/ProductAreaCard'
import { LocationHierarchy, LocationSimple } from '../constants'
import { theme } from '../util'

const LocationView = () => {
  const params = useParams<{ locationCode?: string }>()
  const [locationSection, setLocationSection] = useState<LocationSimple>()
  const [loading, setLoading] = useState<Boolean>(true)

  const locationStats = useDash()

  const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
    return locationHierarchy[0].subLocations.find((sl) => code.includes(sl.code))
  }

  useEffect(() => {
    console.log("INNEEEEEE")
    ;(async () => {
      if (params.locationCode?.includes(locationSection ? locationSection.code : ' ')) {
          setLoading(false)
      } else {
        setLoading(true)
        console.log("I LOADING")
        const res = await getLocationHierarchy()
        if (res && params.locationCode) {
          setLocationSection(findSectionByCode(res, params.locationCode))
        }
        setLoading(false)
      }
    })()
  }, [params.locationCode])

  return (
    <>
      {locationSection && locationStats && !loading && (
        <>
          <PageTitle title={locationSection.displayName} marginBottom="15px" />
          <TeamCounter teams={locationStats.locationSummaryMap[locationSection.code].teamCount} people={locationStats.locationSummaryMap[locationSection.code].resourceCount} />

          <Block width="50%" marginTop={theme.sizing.scale1200}>
            <AccordionFloors
              locationCode={params.locationCode ? params.locationCode : ''}
              section={locationSection}
              locationStats={locationStats?.locationSummaryMap}
            />
          </Block>
        </>
      )}
    </>
  )
}

export default LocationView
