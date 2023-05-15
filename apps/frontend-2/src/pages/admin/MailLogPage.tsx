import { css } from "@emotion/css";
import { BodyLong, Heading, Pagination, Panel, Radio, RadioGroup } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { getMailLog } from "../../api/adminApi";
import { Markdown } from "../../components/Markdown";
import { PageHeader } from "../../components/PageHeader";
import type { MailLog, PageResponse } from "../../constants";
import { Group, userHasGroup, useUser } from "../../hooks";

const panelStyles = css`
  margin-top: 1rem;
  border-radius: 5px;
`;

export const MailLogPage = () => {
  const user = useUser();
  const [log, setLog] = useState<PageResponse<MailLog>>({
    content: [],
    numberOfElements: 0,
    pageNumber: 0,
    pages: 0,
    pageSize: 1,
    totalElements: 0,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filterOutUpdates, setFilterOutUpdates] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getMailLog(page - 1, limit, filterOutUpdates);
      setLog(res);
    })();
  }, [page, limit, filterOutUpdates]);

  if (!userHasGroup(user, Group.ADMIN)) {
    return <>Fant ikke siden.</>;
  }

  return (
    <div>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <PageHeader title="Mail Log" />

        <RadioGroup
          legend="Vis oppdateringer"
          onChange={(v) => setFilterOutUpdates(v === "true")}
          value={filterOutUpdates.toString()}
        >
          <div
            className={css`
              display: flex;
              gap: 1.5rem;
              margin-left: 0.5rem;
            `}
          >
            <Radio value="false">Ja</Radio>
            <Radio value="true">Nei</Radio>
          </div>
        </RadioGroup>
      </div>

      <div
        className={css`
          width: 100%;
          margin-top: 2rem;
        `}
      >
        {log &&
          log.content.map((l, index) => {
            const rowNumber = log.pageNumber * log.pageSize + index + 1;
            let html = l.body;
            const bodyIndex = l.body.indexOf("<body>");
            if (bodyIndex >= 0) {
              html = html.slice(Math.max(0, l.body.indexOf("<body>") + 6));
              html = html.slice(0, Math.max(0, html.lastIndexOf("</body>")));
            }
            // some odd bug in html parser didnt like newlines inside <ul>
            html = html.replaceAll("\n", "");

            return (
              <div
                className={css`
                  margin-bottom: 3rem;
                `}
              >
                <Heading size="medium">
                  #{rowNumber} Tid: {dayjs(l.time).format("DD.MM.YYYY")} Til: {l.to}
                </Heading>
                <Heading size="medium">Emne: {l.subject}</Heading>

                <Panel border className={panelStyles}>
                  <Markdown escapeHtml={false} source={html} />
                </Panel>
              </div>
            );
          })}

        <div
          className={css`
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Pagination boundaryCount={1} count={limit} onPageChange={(x) => setPage(x)} page={page} siblingCount={1} />
        </div>
      </div>
    </div>
  );
};
