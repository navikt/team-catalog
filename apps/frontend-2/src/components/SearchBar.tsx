import {css} from "@emotion/css";
import {components, OptionProps} from "react-select";
import AsyncSelect from "react-select/async";
import {searchProductAreas, searchResource, searchTag, searchTeams} from "../api";
import {Tag} from "@navikt/ds-react";
import {searchClusters} from "../api/clusterApi";
import {useNavigate} from "react-router-dom";
import sortBy from "lodash/sortBy";

const RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT = 3;

type SearchOption = {
    value: string;
    label: string;
    tag: string;
    url: string;
    className: string;
}

const Option = (props: OptionProps<SearchOption>) => {
    return (
            <components.Option {...props}>
                <div className={css`display: flex; justify-content: space-between`}>
<span>{props.data.label}</span>
<Tag className={props.data.className} size="small" variant="info">{props.data.tag}</Tag>
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
            width: 500px;
            border-radius: var(--navds-border-radius-medium);
            border: 1px solid var(--navds-select-color-border);
            &:focus-within {
              outline: none;
              box-shadow: var(--navds-shadow-focus);
            }
          `}
            components={{Option}}
            isClearable
            // NOTE 27 Oct 2022 (Johannes Moskvil): Stupid hack to please TS. SelectedOption can be multiple if used as a multi select therefore ensure only one value is processed
            onChange={(selectedOption) => selectedOption && navigate([selectedOption].flat()[0].url)}
            loadOptions={searchRessurs}
            loadingMessage={() => "Søker..."}
            menuPortalTarget={document.body}
            noOptionsMessage={({ inputValue }) =>
                inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT
                    ? "Må skrive minst 3 tegn for å søke"
                    : `Fant ingen resultater for "${inputValue}"`
            }
            placeholder="Søk etter team, område, person eller tagg"
            styles={{
                // option: (base) => ({...base, color: "red"}),
                // Removes default focus-border so it can be replaced with focus from DesignSystem
                control: (base) => ({ ...base, boxShadow: "none", border: 0 }),
                // Give a high zIndex so that a long result list will overflow from inside a Modal
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                // Make border and size of input box to be identical with those from DesignSystem
                valueContainer: (base) => ({ ...base, padding: "8px", color: "black" }),
            }}
        />
    )
}

async function searchRessurs(inputValue: string) {
    if (inputValue.length < RESOURCE_SEARCH_TERM_LOWER_LENGTH_LIMIT) {
        return [];
    }

    const responses = await Promise.allSettled([createResourceOptions(inputValue), createClusterOptions(inputValue), createTeamOptions(inputValue), createProductAreaOptions(inputValue), createTagOptions(inputValue)]);
    return sortSearchResults(filterFulfilledPromises(responses).flat(), inputValue);
}

function sortSearchResults(options: SearchOption[], inputValue: string): SearchOption[] {
    return sortBy(options, option => {
        console.log(option.label.toLowerCase());
        return option.label.toLowerCase().startsWith(inputValue) ? 0 : 1;
    })
}

async function createResourceOptions(inputValue: string) {
    const resources = await searchResource(inputValue);
    const className = css`background: var(--navds-global-color-lightblue-300)`
    return resources.content.map(({ fullName, navIdent }) => ({ value: navIdent, label: fullName, tag: "Person", url: `resource/${navIdent}`, className }));
}

async function createClusterOptions(inputValue: string) {
    const resources = await searchClusters(inputValue);
    const className = css`background: var(--navds-global-color-limegreen-300)`
    return resources.content.map(({ id, name }) => ({ value: id, label: name, tag: "Klynge", url: `cluster/${id}`, className }));
}

async function createTeamOptions(inputValue: string) {
    const resources = await searchTeams(inputValue);
    const className = css`background: var(--navds-global-color-orange-300)`
    return resources.content.map(({ id, name }) => ({ value: id, label: name, tag: "Team", url: `team/${id}`, className }));
}

async function createProductAreaOptions(inputValue: string) {
    const resources = await searchProductAreas(inputValue);
    const className = css`background: var(--navds-global-color-red-300)`
    return resources.content.map(({ id, name }) => ({ value: id, label: name, tag: "Område", url: `area/${id}`, className }));
}

async function createTagOptions(inputValue: string) {
    const resources = await searchTag(inputValue);
    const className = css`background: var(--navds-global-color-red-300)`
    return resources.content.map(id => ({ value: id, label: id, tag: "Tag", url: `tag/${id}`, className }));
}

function isPromiseFulfilled<T>(settledPromise: PromiseSettledResult<T>): settledPromise is PromiseFulfilledResult<T> {
    return settledPromise.status === 'fulfilled';
}

export function filterFulfilledPromises<T>(promises: Array<PromiseSettledResult<T>>): Array<T> {
    return promises.filter(isPromiseFulfilled).map(({ value }) => value);
}
