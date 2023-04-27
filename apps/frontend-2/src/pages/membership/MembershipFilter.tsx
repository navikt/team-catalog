import { css } from "@emotion/css";
import queryString from "query-string";
import { useLocation, useSearchParams } from "react-router-dom";

import { BasicSelect, SelectLayoutWrapper } from "../../components/select/CustomSelectComponents";
import type { ProductTeam } from "../../constants";
import { TeamRole } from "../../constants";
import { useAllTeams } from "../../hooks";
import { intl } from "../../util/intl/intl";

export function MembershipFilter() {
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 2rem;
        background: var(--a-deepblue-50);
        border: 1px solid var(--a-deepblue-600);
        border-radius: 5px;
        gap: 1rem;
      `}
    >
      <RoleFilter />
      <TeamFilter />
    </div>
  );
}

function TeamFilter() {
  const teams = useAllTeams({});
  const options = createOptionsForTeams(teams.data ?? []);
  const [, setSearchParameters] = useSearchParams();
  const { teamId, ...otherSearchParameters } = queryString.parse(useLocation().search);
  const selectedTeams = new Set([teamId].flat());
  const selectedValues = options.filter((option) => selectedTeams.has(option.value));

  return (
    <SelectLayoutWrapper htmlFor="teams" label="Team">
      <BasicSelect
        inputId="teams"
        isMulti
        onChange={(selectedValues) => {
          const newSearchParameters = queryString.stringify({
            teamId: selectedValues.map(({ value }) => value),
            ...otherSearchParameters,
          });
          setSearchParameters(new URLSearchParams(newSearchParameters));
        }}
        options={options}
        value={selectedValues}
      />
    </SelectLayoutWrapper>
  );
}

function RoleFilter() {
  const options = createOptionsForRoles();
  const [, setSearchParameters] = useSearchParams();
  const { role, ...otherSearchParameters } = queryString.parse(useLocation().search);
  const roles = new Set([role].flat());
  const selectedValues = options.filter((option) => roles.has(option.value));

  return (
    <SelectLayoutWrapper htmlFor="roles" label="Roller">
      <BasicSelect
        inputId="roles"
        isMulti
        onChange={(selectedValues) => {
          const newSearchParameters = queryString.stringify({
            role: selectedValues.map(({ value }) => value),
            ...otherSearchParameters,
          });
          setSearchParameters(new URLSearchParams(newSearchParameters));
        }}
        options={options}
        value={selectedValues}
      />
    </SelectLayoutWrapper>
  );
}

function createOptionsForRoles() {
  return Object.keys(TeamRole).map((role) => ({ value: role, label: intl[role as TeamRole] }));
}

function createOptionsForTeams(teams: ProductTeam[]) {
  return teams.map((team) => ({ value: team.id, label: team.name }));
}
