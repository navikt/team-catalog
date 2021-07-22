import { faChevronLeft, faEdit, faInfo, faPlus, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { ListItem, ListItemLabel } from "baseui/list";
import { Select } from "baseui/select";
import { StatefulTooltip } from "baseui/tooltip";
import { FieldArray, useFormikContext } from "formik";
import React, { ReactNode } from "react";
import { getResourceById, getResourceUnitsById, mapResourceToOption, ResourceOption, useResourceSearch } from "../../api";
import { ProductAreaFormValues, ProductAreaOwnerGroupFormValues } from "../../constants";
import { intl } from "../../util/intl/intl";

function filterOwnerSearch(resourceOptionsToFilter: ResourceOption[], ownerGroup?: ProductAreaOwnerGroupFormValues) {
  const toRemove: string[] = [];
  if (ownerGroup) {
    toRemove.push(ownerGroup.ownerNavId ?? undefined);
    if (ownerGroup.ownerNavId) toRemove.push(ownerGroup.ownerNavId);
    if (ownerGroup.ownerGroupMemberNavIdList) ownerGroup.ownerGroupMemberNavIdList.forEach((it) => toRemove.push(it));
  }

  return resourceOptionsToFilter.filter((it) => !toRemove.includes(it.navIdent));
}

function resourceToText(r: ResourceOption | null, subfix: string): string {
  const typeStr = r?.resourceType ? " (" + intl[r.resourceType] + ") " : "";
  return r ? r.fullName + typeStr + subfix : "Loading";
}

function PersonLabel(props: { navIdent: string; children: ReactNode } | any): JSX.Element {
  const { navIdent } = props;
  const [name, setName] = React.useState<string>();

  React.useEffect(() => {
    if (navIdent === "") {
      setName(intl.dataIsMissing);
      return;
    }
    if (!navIdent.match(/[a-zA-Z]\d{6}/)) return;

    setName("Loading...");
    getResourceById(navIdent)
      .then((r) => setName(resourceToText(mapResourceToOption(r), "")))
      .catch((ex: any) => setName(ex.message));
  }, [navIdent]);

  return (
    <ListItem>
      <Block width="100%" display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <ListItemLabel>
          <StatefulTooltip content={navIdent || ""} focusLock={false}>
            <span>{name}</span>
          </StatefulTooltip>
        </ListItemLabel>
        {props.children}
      </Block>
    </ListItem>
  );
}

interface PersonSearchProps {
  setSelectedResourceOption: (x: ResourceOption | null) => void;
  ownerGroup?: ProductAreaOwnerGroupFormValues;
  starterNavIdent?: string;
}

function PersonSearch(props: PersonSearchProps): JSX.Element {
  const [searchResult, setResourceSearch, loading] = useResourceSearch();

  const formik = useFormikContext<ProductAreaFormValues>();

  const [resource, setResource] = React.useState<ResourceOption[]>([]);

  React.useEffect(() => {
    if (props.starterNavIdent) {
      getResourceById(props.starterNavIdent)
        .then((r) => setResource([mapResourceToOption(r)]))
        .catch((ex: any) => console.error(ex));
    }
    setResourceSearch("");
  }, [props.starterNavIdent]);

  React.useEffect(() => {
    setResource([]);
    props.setSelectedResourceOption(null);
    setResourceSearch("")
  },[formik.values.ownerGroup])

  return (
    <Select
      options={!loading ? filterOwnerSearch(searchResult, props.ownerGroup) : []}
      // options={!loading ? [""] : []}
      filterOptions={(options) => options}
      maxDropdownHeight="400px"
      onChange={({ value }) => {
        setResource(value as ResourceOption[]);
        props.setSelectedResourceOption(value[0] as ResourceOption);
      }}
      onInputChange={async (event) => setResourceSearch(event.currentTarget.value)}
      value={resource}
      isLoading={loading}
      placeholder="Søk etter ansatte"
    />
  );
}

const OwnerBlock = Block;
const OwnerGroupMembersBlock = OwnerBlock;

export default function FormEditOwner(props: any) {
  const formik = useFormikContext<ProductAreaFormValues>();

  const [resourceOption, setResourceOption] = React.useState<ResourceOption | null>(null);
  const [isEditingOwner, setIsEditingOwner] = React.useState<Boolean>();

  function indexOfNavIdent(navIdent: string): number {
    const arr = formik.values.ownerGroup?.ownerGroupMemberNavIdList || [];
    return arr.indexOf(navIdent);
  }

  // when there are no owner and no members in the owner group, the entire ownerGroup field
  // must be set to undefined to avoid triggering schema validation errors on the backend
  React.useEffect(() => {
    const ownerGroup = formik.values.ownerGroup;
    if(ownerGroup){
      const ownerNotSet = !ownerGroup.ownerNavId || ownerGroup.ownerNavId === ""
      const ownerGroupMembersNotSet = !ownerGroup.ownerGroupMemberNavIdList || ownerGroup.ownerGroupMemberNavIdList.length === 0;
      if(ownerNotSet && ownerGroupMembersNotSet) {
        formik.setFieldValue("ownerGroup", undefined)
      }
      if(!ownerNotSet && !ownerGroup.ownerGroupMemberNavIdList){
        // enforce this field to be an array and not undefined
        formik.setFieldValue("ownerGroup.ownerGroupMemberNavIdList",[])
      }
    }

  },[formik.values.ownerGroup])

  return (
    <Block>
      <OwnerBlock width="100%">
        <p>Eier</p>
        {isEditingOwner && (
          <Block width="100%" display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <PersonSearch setSelectedResourceOption={setResourceOption} ownerGroup={formik.values.ownerGroup} starterNavIdent={formik.values.ownerGroup?.ownerNavId} />

            <Button
              type="button"
              kind="minimal"
              onClick={() => {
                formik.setFieldValue("ownerGroup.ownerNavId", resourceOption?.navIdent ?? undefined);
                setIsEditingOwner(false);
              }}
            >
              <FontAwesomeIcon icon={faSave}></FontAwesomeIcon>
            </Button>
            <Button type="button" kind="minimal" onClick={() => setIsEditingOwner(false)}>
              <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
            </Button>
          </Block>
        )}
        {!isEditingOwner && (
          <ul>
            <PersonLabel navIdent={formik.values.ownerGroup?.ownerNavId || ""}>
              <Block>
                <Button type="button" kind="minimal" onClick={() => setIsEditingOwner(true)}>
                  <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                </Button>
              </Block>
            </PersonLabel>
          </ul>
        )}
      </OwnerBlock>

      <OwnerGroupMembersBlock width="100%">
        <p>Eiergruppe</p>
        <FieldArray name="ownerGroup.ownerGroupMemberNavIdList">
          {(arrayHelpers) => {
            const owners = formik.values.ownerGroup?.ownerGroupMemberNavIdList || [];

            return (
              <Block>
                <ul>
                  {owners.map((it) => {
                    return (
                      <PersonLabel navIdent={it} key={it}>
                        <Block>
                          <Button
                            type="button"
                            kind="minimal"
                            onClick={() => {
                              arrayHelpers.remove(indexOfNavIdent(it));
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                          </Button>
                        </Block>
                      </PersonLabel>
                    );
                  })}
                  {!isEditingOwner && (
                    <ListItem>
                      <Block width="100%" display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                        <PersonSearch setSelectedResourceOption={setResourceOption} ownerGroup={formik.values.ownerGroup} />
                        <Button
                          type="button"
                          kind="minimal"
                          onClick={() => {
                            resourceOption && arrayHelpers.push(resourceOption?.navIdent);
                            setResourceOption(null);
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                        </Button>
                      </Block>
                    </ListItem>
                  )}
                </ul>
              </Block>
            );
          }}
        </FieldArray>
      </OwnerGroupMembersBlock>
    </Block>
  );
}
