import { css } from "@emotion/css";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import trimEnd from "lodash/trimEnd";
import { Link, useLocation } from "react-router-dom";

const listStyles = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

type ListViewProperties = {
  list: { id: string; name: string; description: string }[];
  prefixFilter?: string;
};

export const TeamListView = (properties: ListViewProperties) => {
  const { list } = properties;
  const current_pathname = useLocation().pathname;

  const itemsByFirstLetter = groupBy(list, (l) => l.name.toUpperCase().replaceAll("TEAM", "").trim()[0]);

  return (
    <>
      {Object.keys(itemsByFirstLetter).map((letter) => (
        <div
          className={css`
            margin-bottom: 24px;
          `}
          key={letter}
        >
          <div
            className={css`
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            `}
          >
            <div
              className={css`
                display: flex;
                width: 32px;
                height: 32px;
                background-color: #c1dbf2;
                border-radius: 50%;
                align-items: center;
                justify-content: center;
              `}
            >
              <h2
                className={css`
                  font-size: 1.2em;
                `}
              >
                {letter}
              </h2>
            </div>

            <div
              className={css`
                margin-bottom: 24px;
                margin-right: 10px;
              `}
            />
            <div
              className={css`
                width: 100%;
                border-bottom-style: solid;
                border-bottom-color: #e2e2e2;
                border-bottom-width: 2px;
              `}
            />
          </div>

          <div className={listStyles}>
            {sortBy(itemsByFirstLetter[letter], (item) => item.name.toUpperCase()).map((po) => (
              <Link key={po.id} to={`${trimEnd(current_pathname, "/")}/${po.id}`}>
                {po.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
