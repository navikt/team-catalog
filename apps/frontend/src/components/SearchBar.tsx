import { css } from "@emotion/css";
import { Tag } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useNavigate } from "react-router-dom";
import type {
  AriaGuidanceProps,
  AriaOnChangeProps,
  AriaOnFocusProps,
  GroupBase,
  OptionProps,
  OptionsOrGroups,
} from "react-select";
import { components } from "react-select";
import AsyncSelect from "react-select/async";

import { searchClusters } from "../api/clusterApi";
import { searchProductAreas } from "../api/productAreaApi";
import type { NomSearchResult } from "../api/resourceApi";
import { performNomNavidentSearch } from "../api/resourceApi";
import { getResourceById, performNomSearch, searchResource } from "../api/resourceApi";
import { searchTag } from "../api/tagApi";
import { searchTeams } from "../api/teamApi";
import { Status } from "../constants";
import { useUnleashToggle } from "../hooks/useUnleashToggle";

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
  const shouldUseNomSearchForRessurser = useUnleashToggle("teamcatalog.search.ressursFromNom");
  const navigate = useNavigate();

  const searchWithNomToggle = (inputValue: string) => {
    return search(inputValue, shouldUseNomSearchForRessurser);
  };

  return (
    <AsyncSelect
      aria-label="Søkeboks"
      ariaLiveMessages={norwegianAriaLiveMessages}
      autoFocus
      cacheOptions
      className={css`
        cursor: text;
        border-radius: var(--a-border-radius-medium);
        border: 1px solid var(--a-border-strong);

        :focus-within {
          outline: none;
          box-shadow: var(--a-shadow-focus);
        }
      `}
      components={{ Option }}
      controlShouldRenderValue={false}
      isClearable={false}
      loadOptions={searchWithNomToggle}
      loadingMessage={() => "Søker..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT
          ? "Skriv minst 3 tegn for å søke"
          : `Fant ingen resultater for "${inputValue}"`
      }
      // NOTE 27 Oct 2022 (Johannes Moskvil): Stupid hack to please TS. SelectedOption can be multiple if used as a multi select therefore ensure only one value is processed
      onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
      placeholder="Søk etter team, seksjon, person eller tagg"
      screenReaderStatus={({ count }: { count: number }) => `${count} resultat${count > 1 ? "er" : ""}`}
      styles={{
        // Removes default focus-border so it can be replaced with focus from DesignSystem
        control: (base) => ({
          ...base,
          boxShadow: "none",
          border: 0,
          cursor: "text",
          div: { div: { color: `var(--a-text-default)` } },
        }),
        // Make border and size of input box to be identical with those from DesignSystem
        valueContainer: (base) => ({ ...base, padding: "8px", color: "black" }),
        // Remove separator
        indicatorSeparator: (base) => ({ ...base, display: "none" }),
        // Remove dropdownIndicator
        dropdownIndicator: (base) => ({ ...base, display: "none" }),
      }}
    />
  );
}

async function search(inputValue: string, shouldUseNomSearchForRessurser: boolean) {
  if (inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT) {
    return [];
  }
  const responses = await Promise.allSettled([
    createTeamOptions(inputValue),
    createProductAreaOptions(inputValue),
    createClusterOptions(inputValue),
    createTagOptions(inputValue),
    createResourceOptions(inputValue, shouldUseNomSearchForRessurser),
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

async function createResourceOptions(inputValue: string, shouldUseNomSearchForRessurser: boolean) {
  const inputValueIsNavident = inputValue.match(/^[A-Za-z]\d{6}$/) !== null;

  if (shouldUseNomSearchForRessurser) {
    return inputValueIsNavident ? createNomNavidentResourceOptions(inputValue) : createNomResourceOptions(inputValue);
  } else {
    return inputValueIsNavident
      ? createTeamCatalogNavidentResourceOptions(inputValue)
      : createTeamCatalogResourceOptions(inputValue);
  }
}

async function createTeamCatalogResourceOptions(inputValue: string) {
  const resources = (await searchResource(inputValue)).content;

  const className = css`
    background: #e0d8e9;
    border-color: #c0b2d2;
  `;
  return resources.map(({ fullName, navIdent }) => ({
    value: navIdent,
    label: fullName,
    tag: "Person",
    url: `resource/${navIdent}`,
    className,
  }));
}

async function createTeamCatalogNavidentResourceOptions(inputValue: string) {
  const resources = [await getResourceById(inputValue)];

  const className = css`
    background: #e0d8e9;
    border-color: #c0b2d2;
  `;
  return resources.map(({ fullName, navIdent }) => ({
    value: navIdent,
    label: fullName,
    tag: "Person",
    url: `resource/${navIdent}`,
    className,
  }));
}

async function createNomResourceOptions(inputValue: string) {
  try {
    const inputHasWhitespace = /\s/.test(inputValue.trim());
    const wrappedInputValue = inputHasWhitespace ? "'" + inputValue + "'" : inputValue;

    const nomResources = await performNomSearch(wrappedInputValue);

    // Order ressurser with sluttdato in the past last
    const now = new Date().getTime();
    const sortedResources = nomResources.sort((a, b) => {
      const aIsPast = a.sluttdato !== null && new Date(a.sluttdato).getTime() < now;
      const bIsPast = b.sluttdato !== null && new Date(b.sluttdato).getTime() < now;

      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return 0;
    });

    return sortedResources.map(mapToRessurs);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createNomNavidentResourceOptions(navident: string) {
  try {
      navident = navident.toUpperCase();
    const nomResource = await performNomNavidentSearch(navident);
      console.log(nomResource);
    return mapToRessurs(nomResource);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const mapToRessurs = (ressurs: NomSearchResult) => {
  return ressurs.sluttdato === null || new Date(ressurs.sluttdato).getTime() > new Date().getTime()
    ? mapToAktivRessurs(ressurs)
    : mapToSluttetRessurs(ressurs);
};

const mapToAktivRessurs = (ressurs: NomSearchResult) => {
  const className = css`
    background: #e0d8e9;
    border-color: #c0b2d2;
  `;
  return {
    value: ressurs.navident,
    label: ressurs.visningsnavn,
    tag: "Person",
    url: `resource/${ressurs.navident}`,
    className,
  };
};

const mapToSluttetRessurs = (ressurs: NomSearchResult) => {
  const className = css`
    background: #ffeccc;
    border-color: #c77300;
  `;
  return {
    value: ressurs.navident,
    label: ressurs.visningsnavn,
    tag: "Sluttet",
    url: `resource/${ressurs.navident}`,
    className,
  };
};

async function createClusterOptions(inputValue: string) {
  const resources = await searchClusters(inputValue);
  const className = css`
    background: #ebcbd4;
    border-color: #d4a9b6;
  `;
  return resources.content
    .filter(({ status }) => status === Status.ACTIVE)
    .map(({ id, name }) => ({
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
  return resources.content
    .filter(({ status }) => status === Status.ACTIVE)
    .map(({ id, name }) => ({
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
  return resources.content
    .filter(({ status }) => status === Status.ACTIVE)
    .map(({ id, name }) => ({
      value: id,
      label: name,
      tag: "Seksjon",
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
  return promises.filter(isPromiseFulfilled).map(({ value }) => value);
}

export const norwegianAriaLiveMessages = {
  guidance: (properties: AriaGuidanceProps) => {
    const { isSearchable, isMulti, isDisabled, tabSelectsValue, context } = properties;
    switch (context) {
      case "menu": {
        return `Bruk opp og ned til å velge valg${
          isDisabled ? "" : ", trykk Enter for å velge fokusert valg"
        }, trykk Escape for å lukke menyen${tabSelectsValue ? ", trykk Tab til å velge valg og lukke menyen" : ""}.`;
      }
      case "input": {
        return `${properties["aria-label"] || "Select"} er fokusert ${
          isSearchable ? ",skriv for å søke" : ""
        }, bruk ned for å åpne menyen, ${isMulti ? " bruk venstre til å velge fokusert verdi" : ""}`;
      }
      case "value": {
        return "Bruk venstre og høyre til å bytte mellom fokuserte verdier, trykk tilbake for å fjerne fokusert verdi";
      }
      default: {
        return "";
      }
    }
  },

  onChange: <Option, IsMulti extends boolean>(properties: AriaOnChangeProps<Option, IsMulti>) => {
    const { action, label = "", labels, isDisabled } = properties;
    switch (action) {
      case "deselect-option":
      case "pop-value":
      case "remove-value": {
        return `valg ${label}, avvelget.`;
      }
      case "clear": {
        return "Alle valg er tilbakestilt.";
      }
      case "initial-input-focus": {
        return `valg${labels.length > 1 ? "s" : ""} ${labels.join(",")}, valgt.`;
      }
      case "select-option": {
        return isDisabled ? `valg ${label} er blokkert. Velg et annet valg.` : `valg ${label}, valgt.`;
      }
      default: {
        return "";
      }
    }
  },

  onFocus: <Option, Group extends GroupBase<Option>>(properties: AriaOnFocusProps<Option, Group>) => {
    const { context, focused, options, label = "", selectValue, isDisabled, isSelected } = properties;

    const getArrayIndex = (array: OptionsOrGroups<Option, Group>, item: Option) =>
      array && array.length > 0 ? `${array.indexOf(item) + 1} av ${array.length}` : "";

    if (context === "value" && selectValue) {
      return `verdi ${label} fokusert, ${getArrayIndex(selectValue, focused)}.`;
    }

    if (context === "menu") {
      const disabled = isDisabled ? " blokkert" : "";
      const status = `${isSelected ? "valgt" : "fokusert"}${disabled}`;
      return `Valg ${label} ${status}, ${getArrayIndex(options, focused)}.`;
    }
    return "";
  },
};
