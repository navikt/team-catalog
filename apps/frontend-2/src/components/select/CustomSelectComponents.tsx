import { css, cx } from "@emotion/css";
import { Chips, ErrorMessage, Label } from "@navikt/ds-react";
import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import type { CSSObjectWithLabel, GroupBase, MenuListProps, MultiValueProps, Props } from "react-select";
import Select, { components } from "react-select";
import type { AsyncProps } from "react-select/async";
import AsyncSelect from "react-select/async";
import type { CreatableProps } from "react-select/creatable";
import CreatableSelect from "react-select/creatable";

const commonSelectCss = css`
  border-radius: var(--a-border-radius-medium);
  border: 1px solid var(--a-border-strong);

  width: 100%;
  min-height: 48px;

  color: var(--a-gray-900);

  & > div {
    cursor: text;
  }

  &:hover {
    border-color: var(--ac-textfield-hover-border, var(--a-border-action));
  }

  &:focus-within {
    outline: none;
    box-shadow: var(--a-shadow-focus);
  }
`;

const commonSelectOverwriteStyles = {
  clearIndicator: (base: CSSObjectWithLabel) => ({ ...base, cursor: "pointer" }),
  // Removes default focus-border, so it can be replaced with focus from DesignSystem
  control: (base: CSSObjectWithLabel) => ({ ...base, boxShadow: "none", border: 0, minHeight: "48px" }),
  // Give a high zIndex so that a long result list will overflow from inside a Modal
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
  // Make border and size of input box to be identical with those from DesignSystem
  valueContainer: (base: CSSObjectWithLabel) => ({ ...base, padding: "4px", color: "black", gap: "0.5rem" }),
  // Remove separator
  indicatorSeparator: (base: CSSObjectWithLabel) => ({ ...base, display: "none" }),
  dropdownIndicator: (base: CSSObjectWithLabel) => ({ ...base, color: "var(--a-gray-900)" }),
  placeholder: (base: CSSObjectWithLabel) => ({ ...base, color: "var(--a-gray-900)" }),
  noOptionsMessage: (base: CSSObjectWithLabel) => ({ ...base, color: "var(--a-gray-900)" }),
};

const errorCss = css`
  > div {
    border-color: var(--ac-textfield-error-border, var(--a-border-danger));
    box-shadow: 0 0 0 1px var(--ac-textfield-error-border, var(--a-border-danger));
  }
`;

export function AsyncSearch<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(properties: AsyncProps<Option, IsMulti, Group>) {
  return (
    <AsyncSelect
      {...properties}
      cacheOptions
      className={commonSelectCss}
      components={{ MenuList: CustomMenuList, ...properties.components }}
      isClearable
      loadingMessage={() => "Søker..."}
      menuPortalTarget={document.body}
      styles={{ ...commonSelectOverwriteStyles, dropdownIndicator: (base) => ({ ...base, display: "none" }) }}
    />
  );
}

/**
 * Limit the number of items in the displayed list to 100 to help performance.
 * It is much more efficient to type a more specific search rather than look through a dropdown list of more than 100 items.
 */
function CustomMenuList<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(
  properties: MenuListProps<Option, IsMulti, Group>
) {
  const { children } = properties;
  const filteredChildren = Array.isArray(children) ? children.slice(0, 40) : children;
  return <components.MenuList {...properties}>{filteredChildren}</components.MenuList>;
}

function CustomMultiValue<Option, IsMulti extends boolean = true, Group extends GroupBase<Option> = GroupBase<Option>>(
  properties: MultiValueProps<Option, IsMulti, Group>
) {
  return (
    <components.MultiValueContainer {...properties}>
      {/*Not sure how to consolidate that removeProps are for divs, and the Removable chip is a button*/}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/*@ts-ignore*/}
      <Chips.Removable
        className={cx({
          [css`
            background: var(--a-deepblue-400);
          `]: properties.isFocused,
        })}
        tabIndex={-1}
        {...properties.removeProps}
      >
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*@ts-ignore*/}
        {properties.data.label}
      </Chips.Removable>
    </components.MultiValueContainer>
  );
}

export function SelectLayoutWrapper({
  label,
  children,
  htmlFor,
  error,
}: {
  label: string;
  children: ReactNode;
  htmlFor: string;
  error?: FieldError;
}) {
  return (
    <div
      className={cx(
        "navds-form-field",
        css`
          display: flex;
          flex-direction: column;
          gap: var(--a-spacing-2);
        `,
        { [errorCss]: !!error }
      )}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
}

export function BasicSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(properties: Props<Option, IsMulti, Group>) {
  return (
    <Select
      {...properties}
      className={commonSelectCss}
      components={{ MenuList: CustomMenuList, MultiValue: CustomMultiValue, ...properties.components }}
      escapeClearsValue
      isClearable
      isSearchable
      menuPortalTarget={document.body}
      placeholder={properties.placeholder ?? ""}
      styles={commonSelectOverwriteStyles}
    />
  );
}

export function BasicCreatableSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(properties: CreatableProps<Option, IsMulti, Group>) {
  return (
    <CreatableSelect
      {...properties}
      className={commonSelectCss}
      components={{ MenuList: CustomMenuList, MultiValue: CustomMultiValue, ...properties.components }}
      escapeClearsValue
      isClearable
      isSearchable
      menuPortalTarget={document.body}
      placeholder={properties.placeholder ?? ""}
      styles={commonSelectOverwriteStyles}
    />
  );
}
