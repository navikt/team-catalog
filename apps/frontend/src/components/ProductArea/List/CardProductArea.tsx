import * as React from 'react'
import {useEffect, useState} from 'react'
import {Card, StyledBody} from 'baseui/card';
import {ProductArea, Resource} from '../../../constants';
import {Label2, Paragraph2} from 'baseui/typography';
import {Block, BlockProps} from 'baseui/block';
import {theme} from '../../../util';
import RouteLink from '../../common/RouteLink'
import {marginAll} from '../../Style'
import {cardShadow} from '../../common/Style'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";
import {intl} from "../../../util/intl/intl";
import {getAllTeamsForProductArea} from '../../../api/teamApi'

type CardProductAreaProps = {
  productArea: ProductArea
  resource?: Resource
}

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: { label: string, text: string | number }) => (
  <Block display="flex" alignItems="baseline">
    <Block marginRight={theme.sizing.scale600}><Label2 marginBottom="0">{props.label}:</Label2></Block>
    <Block><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
  </Block>
)

const CardProductArea = (props: CardProductAreaProps) => {
  const member = props.resource ? props.productArea.members.filter(m => m.navIdent === props.resource?.navIdent).pop() : undefined
  const [teams, setTeams] = useState(0)

  useEffect(() => {
    (async () => {
      setTeams((await getAllTeamsForProductArea(props.productArea.id)).totalElements)
    })()
  }, [])
  return (

    <Card
      title={<RouteLink href={`/productarea/${props.productArea.id}`} hideUnderline>{props.productArea.name}</RouteLink>}
      overrides={{
        Root: {
          style: {
            ...cardShadow.Root.style,
            width: '450px',
            ...marginAll(theme.sizing.scale200),
          }
        },
        Body: {
          style: {
            marginBottom: 0
          }
        },
        Title: {
          style: {
            marginBottom: 0
          }
        }
      }}>
      <StyledBody>
        <Block  {...contentBlockProps}>
          <Block flex={1}>
            {member && <TextWithLabel
              label="Roller"
              text={member?.roles.map(role => intl.getString(role)).join(", ") || ''}
            />}
            <TextWithLabel label="Medlemmer" text={props.productArea.members.length}/>
            <TextWithLabel label="Team" text={teams}/>
          </Block>
          <Block flex='0 0 50px'>
            <FontAwesomeIcon icon={faBuilding} size='2x' color={theme.colors.accent300}/>
          </Block>
        </Block>
      </StyledBody>
    </Card>
  )
}

export default CardProductArea
