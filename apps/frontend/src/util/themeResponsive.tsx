import { theme } from "./theme";

const breakpoints: any = {
  small: 550,
  medium: 800,
  large: 1280,
};

const ResponsiveTheme = Object.keys(breakpoints).reduce((acc: any, key: any) => {
  acc.mediaQuery[key] = `@media screen and (min-width: ${breakpoints[key]}px)`;
  return acc;
},
  {
    breakpoints,
    mediaQuery: {},
  },
);
export const MyTheme = { ...theme, ...ResponsiveTheme };