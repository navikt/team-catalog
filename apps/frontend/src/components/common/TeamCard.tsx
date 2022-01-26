import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Block, BlockProps } from "baseui/block";
import { Card } from "baseui/card";
import React, { useEffect, useState } from "react";
import { ProductTeam } from "../../constants";
import { theme } from "../../util";
import { marginAll } from "../Style";
import RouteLink from "./RouteLink";
import { cardShadow } from "./Style";
import { TextWithLabel } from "./TextWithLabel";

const contentBlockProps: BlockProps = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.sizing.scale500,
}

type TeamCardProps = {
    team: ProductTeam
}

const TeamCard = (props: TeamCardProps) => {
    const { team } = props
    return (
        <>
            <Card
                title={<RouteLink href={`/team/${team.id}`} hideUnderline>{team.name}</RouteLink>}
                overrides={{
                    Root: {
                        style: {
                            ...cardShadow.Root.style,
                            width: '45%',
                            ...marginAll(theme.sizing.scale100),
                            marginBottom: '10px'
                        }
                    },
                    Body: {
                        style: {
                            marginBottom: 0
                        }
                    },
                }}
            >
                <Block  {...contentBlockProps}>
                    <Block flex={1}>
                        <TextWithLabel label="Medlemmer: &nbsp;" text={team.members.length} display="flex" alignItems="baseline" />
                    </Block>
                    <Block flex='0 0 50px'>
                        <FontAwesomeIcon icon={faUsers} size='2x' color={theme.colors.accent300} />
                    </Block>
                </Block>
            </Card>
        </>
    )
}

export default TeamCard
