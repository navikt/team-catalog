import { css } from "@emotion/css";
import { Tag } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useNavigate } from "react-router-dom";
import type { OptionProps } from "react-select";
import { components } from "react-select";
import AsyncSelect from "react-select/async";

import { searchProductAreas, searchResource, searchTag, searchTeams } from "../api";
import { searchClusters } from "../api/clusterApi";

const RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT = 3;

type SearchOption = {
  value: string;
  label: string;
  tag: string;
  url: string;
  className: string;
};

const Option = (properties: OptionProps<SearchOption>) => {
  return (
    <components.Option {...properties}>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <span>{properties.data.label}</span>
        <Tag className={properties.data.className} size="small" variant="info">
          {properties.data.tag}
        </Tag>
      </div>
    </components.Option>
  );
};

export function SearchBar() {
  const navigate = useNavigate();

  return (
    <AsyncSelect
      cacheOptions
      className={css`
        cursor: text;
        width: 500px;
        border-radius: var(--navds-border-radius-medium);
        border: 1px solid var(--navds-select-color-border);
        &:focus-within {
          outline: none;
          box-shadow: var(--navds-shadow-focus);
        }
      `}
      components={{ Option }}
      controlShouldRenderValue={false}
      isClearable
      loadOptions={searchRessurs}
      loadingMessage={() => "Søker..."}
      menuPortalTarget={document.body}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT
          ? "Må skrive minst 3 tegn for å søke"
          : `Fant ingen resultater for "${inputValue}"`
      }
      // NOTE 27 Oct 2022 (Johannes Moskvil): Stupid hack to please TS. SelectedOption can be multiple if used as a multi select therefore ensure only one value is processed
      onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
      placeholder="Søk etter team, område, person eller tagg"
      styles={{
        // Removes default focus-border so it can be replaced with focus from DesignSystem
        control: (base) => ({ ...base, boxShadow: "none", border: 0, cursor: "text" }),
        // Make border and size of input box to be identical with those from DesignSystem
        valueContainer: (base) => ({ ...base, padding: "8px", color: "black" }),
      }}
    />
  );
}

async function searchRessurs(inputValue: string) {
  if (inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT) {
    return [];
  }

  const responses = await Promise.allSettled([
    createTeamOptions(inputValue),
    createResourceOptions(inputValue),
    createProductAreaOptions(inputValue),
    createClusterOptions(inputValue),
    createTagOptions(inputValue),
  ]);
  return sortSearchResults(filterFulfilledPromises(responses).flat(), inputValue);
}

function sortSearchResults(options: SearchOption[], inputValue: string): SearchOption[] {
  return sortBy(options, (option) => {
    const someWordStartsWithInputValue = option.label
      .toLowerCase()
      .split(" ")
      .some((word) => word.startsWith(inputValue));
    return someWordStartsWithInputValue ? 0 : 1;
  });
}

async function createResourceOptions(inputValue: string) {
  const resources = await searchResource(inputValue);
  const className = css`
    background: #e0d8e9;
    border-color: #c0b2d2;
  `;
  return resources.content.map(({ fullName, navIdent }) => ({
    value: navIdent,
    label: fullName,
    tag: "Person",
    url: `resource/${navIdent}`,
    className,
  }));
}

async function createClusterOptions(inputValue: string) {
  const resources = await searchClusters(inputValue);
  const className = css`
    background: #ebcbd4;
    border-color: #d4a9b6;
  `;
  return resources.content.map(({ id, name }) => ({
    value: id,
    label: name,
    tag: "Klynge",
    url: `cluster/${id}`,
    className,
  }));
}

async function createTeamOptions(inputValue: string) {
  const resources = await searchTeams(inputValue);
  const className = css`
    background: #c3e0ea;
    border-color: #79b1c3;
  `;
  return resources.content.map(({ id, name }) => ({
    value: id,
    label: name,
    tag: "Team",
    url: `team/${id}`,
    className,
  }));
}

async function createProductAreaOptions(inputValue: string) {
  const resources = await searchProductAreas(inputValue);
  const className = css`
    background: #c9e7d1;
    border-color: #80bb90;
  `;
  return resources.content.map(({ id, name }) => ({
    value: id,
    label: name,
    tag: "Område",
    url: `area/${id}`,
    className,
  }));
}

async function createTagOptions(inputValue: string) {
  const resources = await searchTag(inputValue);
  const className = css`
    background: #e4e8bc;
    border-color: #c6cc87;
  `;
  return resources.content.map((id) => ({ value: id, label: id, tag: "Tag", url: `tag/${id}`, className }));
}

function isPromiseFulfilled<T>(settledPromise: PromiseSettledResult<T>): settledPromise is PromiseFulfilledResult<T> {
  return settledPromise.status === "fulfilled";
}

export function filterFulfilledPromises<T>(promises: Array<PromiseSettledResult<T>>): Array<T> {
  // eslint-disable-next-line unicorn/no-array-callback-reference -- If explicitly passing callback argument the Type-Safe function does not compute correctly. Unable to figure out why
  return promises.filter(isPromiseFulfilled).map(({ value }) => value);
}
