import React from "react";
import {css} from "@emotion/css";

const hideOnFocusLost = css`
  display: flex;
  justify-content: center;

  a:not(:focus) {
    opacity: 0;
    position: absolute;
    z-index: -1;
  }
`;

export function JumpToContent({id}: { id: string }) {
    return (
        <div className={hideOnFocusLost}>
            <a href={`#${id}`} tabIndex={0}>
                Hopp til hovedinnhold
            </a>
        </div>
    );
}
