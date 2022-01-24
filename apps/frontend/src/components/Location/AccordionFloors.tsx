import { Block } from 'baseui/block'
import React, { useEffect, useState } from 'react'
import { LocationSimple, ProductTeam } from '../../constants'
import { Accordion, Panel } from 'baseui/accordion'
import { getAllTeamsByLocationCode } from '../../api'
import TeamCard from '../common/TeamCard'
import { Paragraph2 } from 'baseui/typography'
import { generatePath, useHistory } from 'react-router'
import { LocationSummary } from '../dash/Dashboard'
import PanelTitle from './PanelTitle'
import { SIZE, StyledSpinnerNext } from 'baseui/spinner'

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
      <Accordion
        onChange={({ expanded }) => (expanded.length ? history.replace(generatePath('/location/:locationCode', { locationCode: expanded[0]})) : undefined)}
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
            <Panel
                key={floor.code}
                expanded={floor.code === locationCode}
                title={<PanelTitle title={floor.description} locationSummary={locationStats ? locationStats[floor.code] : undefined}/>}
            >
              {loading && (<StyledSpinnerNext $size={SIZE.small}/>)}

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
      </Accordion>
    </>
  )
}

export default AccordionFloors
