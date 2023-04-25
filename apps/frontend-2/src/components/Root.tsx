import * as React from "react";
import { Helmet } from "react-helmet";

interface RootProperties {
  children: JSX.Element | Array<JSX.Element>;
}

export const Root = ({ children }: RootProperties): JSX.Element => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Teamkatalogen</title>
      </Helmet>
      {children}
    </div>
  );
};
