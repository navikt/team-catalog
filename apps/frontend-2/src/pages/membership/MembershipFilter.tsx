import { css } from "@emotion/css";
import queryString from "query-string";
import { useLocation, useSearchParams } from "react-router-dom";

import { BasicSelect, SelectLayoutWrapper } from "../../components/select/CustomSelectComponents";
import type { Cluster, ProductArea, ProductTeam } from "../../constants";
import { TeamRole } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { intl } from "../../util/intl/intl";
import { ResetFilterButton } from "./ResetFilterButton";

export function MembershipFilter() {
  return (
    <div
      className={css`
        padding: 2rem;
        background: var(--a-deepblue-50);
        border: 1px solid var(--a-deepblue-600);
        border-radius: 5px;
        display: flex;
        gap: 1rem;
        flex-direction: column;
      `}
    >
      <div
        className={css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        `}
      >
        <RoleFilter />
        <TeamFilter />
        <ProductAreaFilter />
        <ClusterFilter />
      </div>
      <ResetFilterButton
        className={css`
          width: fit-content;
          align-self: end;
        `}
      />
    </div>
  );
}

function ProductAreaFilter() {
  const productAreas = useAllProductAreas({});
  const options = createSimpleOptions(productAreas.data ?? []);

  return <GenericFilter label="Område" options={options} searchParameterKey="productAreaId" />;
}

function ClusterFilter() {
  const clusters = useAllClusters({});
  const options = createSimpleOptions(clusters.data ?? []);

  return <GenericFilter label="Klynge" options={options} searchParameterKey="clusterId" />;
}

function TeamFilter() {
  const teams = useAllTeams({});
  const options = createSimpleOptions(teams.data ?? []);
  return <GenericFilter label="Team" options={options} searchParameterKey="teamId" />;
}

function RoleFilter() {
  const options = createOptionsForRoles();
  return <GenericFilter label="Rolle" options={options} searchParameterKey="role" />;
}

function GenericFilter({
  options,
  searchParameterKey,
  label,
}: {
  label: string;
  searchParameterKey: string;
  options: { value: string; label: string }[];
}) {
  const [keyValues, updateSearchParameter] = useUpdateSearchParameters(searchParameterKey);
  const selectedOptions = options.filter((option) => keyValues.includes(option.value));

  return (
    <SelectLayoutWrapper htmlFor={searchParameterKey} label={label}>
      <BasicSelect
        inputId={searchParameterKey}
        isMulti
        onChange={(newOptions) => updateSearchParameter(newOptions.map(({ value }) => value))}
        options={options}
        value={selectedOptions}
      />
    </SelectLayoutWrapper>
  );
}

function useUpdateSearchParameters(key: string): [string[], (values: string[]) => void] {
  const [, setSearchParameters] = useSearchParams();
  const searchParameters = queryString.parse(useLocation().search);

  const updateSearchParameters = (newParameters: string[]) => {
    const newSearchParameters = queryString.stringify({
      ...searchParameters,
      [key]: newParameters,
    });
    setSearchParameters(new URLSearchParams(newSearchParameters));
  };

  const relevantParameter = convertToList(searchParameters[key]);

  return [relevantParameter, updateSearchParameters];
}

function createOptionsForRoles() {
  return Object.keys(TeamRole).map((role) => ({ value: role, label: intl[role as TeamRole] }));
}

function createSimpleOptions(data: (ProductTeam | Cluster | ProductArea)[]) {
  return data.map((d) => ({ value: d.id, label: d.name }));
}

export function convertToList<T>(argument: T): string[] {
  if (typeof argument === "string" || Array.isArray(argument)) {
    return [argument].flat();
  }
  return [];
}
