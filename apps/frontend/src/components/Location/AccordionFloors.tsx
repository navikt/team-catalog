import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { LocationSimple, ProductTeam } from '../../constants'
import { Accordion, Panel, StatelessAccordion } from 'baseui/accordion'
import { getAllTeamsByLocationCode } from '../../api'
import TeamCard from '../common/TeamCard'
import AccordionTitle from '../common/AccordionTitle'
import { Paragraph2 } from 'baseui/typography'
import { generatePath, useHistory } from 'react-router'
import { DashData, LocationSummary } from '../dash/Dashboard'
import PanelTitle from './PanelTitle'

type AccordionFloorsProps = {
  locationCode: string
  section: LocationSimple
  floorList: LocationSimple[]
  locationStats: { [k: string]: LocationSummary } | undefined
}

const AccordionFloors = (props: AccordionFloorsProps) => {
  const { locationCode, section, floorList, locationStats } = props
  const history = useHistory()

  const [currentTeamList, setCurrentTeamList] = useState<ProductTeam[]>()
  const [loading, setLoading] = useState<Boolean>(true)

  const handleOnExpand = async (code: string) => {
    console.log(code, 'CODE')
    window.history.replaceState({}, '', code)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const res = await getAllTeamsByLocationCode(locationCode)
      if (res) setCurrentTeamList(res.content)
      setLoading(false)
    })()
  }, [locationCode])

  return (
    <>
      <StatelessAccordion
        onChange={({ expanded }) => (expanded.length ? handleOnExpand(expanded[0] as string) : undefined)}
        expanded={locationCode ? [locationCode] : []}
        overrides={{
          Root: { style: { border: '2px solid #F2F8FD' } },
          Header: { style: { background: '#F2F8FD' } },
          Content: {
            style: {
              margin: '0px',
              backgroundColor: 'none',
              padding: '10px',
            },
          },
        }}
      >
        {section.subLocations &&
          floorList.map((floor: LocationSimple) => (
            <Panel key={floor.code} title={<PanelTitle title={floor.description} locationSummary={locationStats ? locationStats[floor.code] : undefined}/>}>
              {!loading && currentTeamList && (
                <Block width="100%" display="flex" flexWrap justifyContent="space-between">
                  {currentTeamList.length > 0 ? (
                    currentTeamList.map((team: ProductTeam) => <TeamCard team={team} />)
                  ) : (
                    <Paragraph2 margin="0px 15px">Fant ingen teams på denne etasjen.</Paragraph2>
                  )}
                </Block>
              )}
            </Panel>
          ))}
      </StatelessAccordion>
    </>
  )
}

export default AccordionFloors

// export const genProcessPath = (code: string) =>
//   generatePath("/location/:locationCode?", {locationCode: code}))
