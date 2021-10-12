import * as React from 'react'
import {useState} from 'react'
import {Card, CardOverrides} from 'baseui/card'
import {Block} from 'baseui/block';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faUserCircle, faUsers} from '@fortawesome/free-solid-svg-icons';
import {H6, LabelSmall} from 'baseui/typography';
import {theme} from '../../util';
import RouteLink from '../common/RouteLink'
import {primitives} from '../../util/theme'
import {borderColor} from '../common/Style'
import {marginAll} from '../Style'


const cardBackgroundColor = () => {
  return "#d5e899"
}

const cardOverrides = (hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          background: cardBackgroundColor(),
          margin: theme.sizing.scale200,
        }
        return hover ? {
          ...base,
          ...borderColor(primitives.primary350)
          ,
          boxShadow: '0px 4px 2px -1px rgba(0,0,0,0.7);'
        } : base
      }
    },
    Body: {
      style: () => {
        return {
          width: "450px",
          marginBottom: 0
        }
      }
    },
    Contents: {
      style: () => {
        return {
          ...marginAll(theme.sizing.scale500)
        }
      }
    }
  } as CardOverrides
}


type OrgEnhetCardProps = {
  navn: string
  idUrl: string
}

export const OrgEnhetCard = (props: OrgEnhetCardProps) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={`/org/${props.idUrl}`} hideUnderline plain>
        <Card overrides={cardOverrides(hover)}>
          <Block display='flex' alignItems='center' justifyContent='space-between'>
            <Block height="100%" display='flex' flexDirection='column' justifyContent='space-around'>
              <H6 marginTop="0" marginBottom={theme.sizing.scale100} $style={{
                wordBreak: 'break-word',
                color: hover ? primitives.primary350 : undefined,
                textDecoration: hover ? 'underline' : undefined
              }}>{props.navn}</H6>
            </Block>
            <Block marginRight={hover ? '0px' : '10px'}>
              <FontAwesomeIcon icon={faChevronRight} color={theme.colors.primaryA}/>
            </Block>
          </Block>
        </Card>
      </RouteLink>
    </div>
  )
}
