import { Block } from "baseui/block";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom"
import { getLocationByCode, getLocationHierarchy } from "../api/location";
import PageTitle from "../components/common/PageTitle";
import { useDash } from "../components/dash/Dashboard";
import AccordionFloors from "../components/Location/AccordionFloors";
import { LocationHierarchy, LocationSimple } from "../constants";

const LocationView = () => {
    const params = useParams<{ locationCode?: string }>()
    const [locationSection, setLocationSection] = useState<LocationSimple>()
    const [loading, setLoading] = useState<Boolean>(true)

    const locationStats = useDash()

    const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
        return locationHierarchy[0].subLocations.find(sl => code.includes(sl.code))
    }

    useEffect(() => {
        (async () => {
            setLoading(true)
            const res = await getLocationHierarchy()
            if (res && params.locationCode) setLocationSection(findSectionByCode(res, params.locationCode))
            setLoading(false)

        })()
    }, [params.locationCode])

    return (
        <>
            {locationSection && (
                <>
                    <PageTitle title={locationSection.displayName} />

                    {!loading && locationSection.subLocations && params.locationCode && (
                        <Block width="50%">
                            <AccordionFloors 
                                locationCode={params.locationCode}
                                section={locationSection}
                                floorList={locationSection.subLocations.reverse()}
                            />
                        </Block>
                    )}
                </>
            )}
        </>
    )
}

export default LocationView
