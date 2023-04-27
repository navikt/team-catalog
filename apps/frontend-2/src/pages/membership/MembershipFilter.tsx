import { css } from "@emotion/css";
import queryString from "query-string";
import { useLocation, useSearchParams } from "react-router-dom";

import { BasicSelect, SelectLayoutWrapper } from "../../components/select/CustomSelectComponents";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";

export function MembershipFilter() {
  return (
    <div
      className={css`
        display: flex;
        padding: 2rem;
        background: var(--a-deepblue-50);
        border: 1px solid var(--a-deepblue-600);
        border-radius: 5px;
      `}
    >
      <RoleFilter />
    </div>
  );
}

function RoleFilter() {
  const options = createOptions();
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

function createOptions() {
  return Object.keys(TeamRole).map((role) => ({ value: role, label: intl[role as TeamRole] }));
}
