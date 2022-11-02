import { css } from "@emotion/css";
import { Alert } from "@navikt/ds-react";
import { Link } from "react-router-dom";


export const ErrorMessageWithLink = (properties: { errorMessage: string, linkText: string, href: string }) => (
    <Alert size="medium" variant="error">
      <div>
        {properties.errorMessage}
        <div className={css`margin-top: 1rem;`}>
          <Link to={properties.href}>{properties.linkText}</Link>
        </div>
      </div>
    </Alert>
  )