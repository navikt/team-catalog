import { css } from "@emotion/css";
import { Alert } from "@navikt/ds-react";
import { Link } from "react-router-dom";


export const ErrorMessageWithLink = (props: { errorMessage: string, linkText: string, href: string }) => (
    <Alert variant="error" size="medium">
      <div>
        {props.errorMessage}
        <div className={css`margin-top: 1rem;`}>
          <Link to={props.href}>{props.linkText}</Link>
        </div>
      </div>
    </Alert>
  )