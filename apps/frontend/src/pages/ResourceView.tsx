import React, {useEffect, useState} from "react";
import {RouteComponentProps} from "react-router-dom";
import {PathParams} from "./TeamPage";
import {getResourceById} from "../api/resourceApi";
import {Resource} from "../constants";
import {Spinner} from "baseui/spinner";
import {Label1} from "baseui/typography";
import {Block} from "baseui/block";
import {theme} from "../util";
import {TextWithLabel} from "../components/common/TextWithLabel";
import {UserImage} from "../components/common/UserImage";

const ResourceView = (props: RouteComponentProps<PathParams>) => {

  const [resource, setResource] = useState<Resource>()
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resourceResponse = await getResourceById(props.match.params.id);
        setResource(resourceResponse)
        console.log("OK")
      } catch (e) {
        setResource(undefined)
        console.log("Something went wrong")
      }
      setLoading(false)
    })()
  }, [props.match.params.id])

  return !isLoading ?
    (<>
      <Block display={"flex"} width={"100%"}>
        <Label1>{resource?.fullName}</Label1>
      </Block>
        <Block display="flex" width='100%'>
          <Block width="30%">
            <TextWithLabel label={"Nav-Ident"} text={resource?.navIdent}/>
            <TextWithLabel label={"Type"} text={resource?.resourceType}/>
            <TextWithLabel label={"Epost"} text={resource?.email}/>
            <TextWithLabel label={"Start dato"} text={resource?.startDate}/>
          </Block>

          <Block
            marginTop="0"
            paddingLeft={theme.sizing.scale800}
            $style={{borderLeft: `1px solid ${theme.colors.mono600}`}}
          >
            <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} maxWidth={"100px"}/>)}/>
          </Block>
        </Block>
    </>) :
    (<>
      <Block>
        <Spinner size={40}/>
      </Block>
    </>)
}

export default ResourceView
