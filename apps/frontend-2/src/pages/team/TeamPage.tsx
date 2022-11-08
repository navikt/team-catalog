import { css } from "@emotion/css";
import { EditFilled, FileFilled, ListFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import SvgEmailFilled from "@navikt/ds-icons/esm/EmailFilled";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { editTeam, getProductArea, getResourceById, getTeam } from "../../api";
import { useClusters } from "../../api/clusterApi";
import { getContactAddressesByTeamId } from "../../api/ContactAddressApi";
import { getProcessesForTeam } from "../../api/integrationApi";
import { AuditName } from "../../components/AuditName";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import LocationSection from "../../components/team/LocationSection";
import ShortSummarySection from "../../components/team/ShortSummarySection";
import type {
  ContactAddress,
  Process,
  ProductArea,
  ProductTeam,
  ProductTeamFormValues,
  Resource,
} from "../../constants";
import { ResourceType } from "../../constants";
import { ampli } from "../../services/Amplitude";
import { user } from "../../services/User";
import { processLink } from "../../util/config";
import { intl } from "../../util/intl/intl";
import { theme } from "../../util/theme";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [team, setTeam] = useState<ProductTeam>();
  const [productArea, setProductArea] = useState<ProductArea>();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const clusters = useClusters(team?.clusterIds);
  const [contactAddresses, setContactAddresses] = useState<ContactAddress[]>();
  const [contactPersonResource, setContactPersonResource] = useState<Resource>();
  const [teamOwnerResource, setTeamOwnerResource] = useState<Resource>();
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  dayjs.locale("nb");

  const getExternalLength = () =>
    team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0;

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const editResponse = await editTeam(values);
    if (editResponse.id) {
      await updateTeam(editResponse);
      setShowEditModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(editResponse);
    }
  };

  const updateTeam = async (teamUpdate: ProductTeam) => {
    setTeam(teamUpdate);

    if (user.isMemberOf(teamUpdate)) setContactAddresses(teamUpdate.contactAddresses);

    if (teamUpdate.productAreaId) {
      const productAreaResponse = await getProductArea(teamUpdate.productAreaId);
      setProductArea(productAreaResponse);
    } else {
      setProductArea(undefined);
    }
  };

  useEffect(() => {
    (async () => {
      if (team) {
        if (team.contactPersonIdent) {
          const contactPersonResponse = await getResourceById(team.contactPersonIdent);
          setContactPersonResource(contactPersonResponse);
        } else {
          setContactPersonResource(undefined);
        }
        if (team.teamOwnerIdent) {
          setTeamOwnerResource(await getResourceById(team.teamOwnerIdent));
        } else {
          setTeamOwnerResource(undefined);
        }
      }
    })();
  }, [team, loading, showEditModal]);

  useEffect(() => {
    (async () => {
      if (teamId) {
        setLoading(true);
        try {
          const teamResponse = await getTeam(teamId);
          ampli.logEvent("teamkat_view_team", { team: teamResponse.name });
          await updateTeam(teamResponse);
          getProcessesForTeam(teamId).then(setProcesses);
        } catch (error) {
          let errorMessage = "Failed to do something exceptional";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          console.log(errorMessage);
        }
        setLoading(false);
      }
    })();
  }, [teamId]);

  useEffect(() => {
    if (team && user.isMemberOf(team) && contactAddresses?.length)
      getContactAddressesByTeamId(team.id).then(setContactAddresses);
    else setContactAddresses([]);
  }, [team?.contactAddresses]);

  return (
    <div>
      {!loading && !team && (
        <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />
      )}

      {team && (
        <>
          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            `}
          >
            <PageTitle title={team.name} />
            {team.changeStamp && (
              <div
                className={css`
                  margin-top: 0.5rem;
                `}
              >
                <BodyShort size="small">
                  <b>Sist endret av :</b> <AuditName name={team.changeStamp.lastModifiedBy} /> -{" "}
                  {dayjs(team.changeStamp?.lastModifiedDate).format("D. MMMM, YYYY H:mm ")}
                </BodyShort>
              </div>
            )}
          </div>

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              margin-top: 2rem;
            `}
          >
            <StatusField status={team.status} />

            <div
              className={css`
                display: flex;
              `}
            >
              {/* {user.isAdmin() && <AuditButton id={team.id} marginRight />} -- Venter til adminviews er på plass */}

              {user.canWrite() && (
                <Button
                  className={css`
                    margin-right: 1rem;
                  `}
                  icon={<EditFilled aria-hidden />}
                  onClick={() => setShowEditModal(true)}
                  size="medium"
                  variant="secondary"
                >
                  {intl.edit}
                </Button>
              )}
              <Button
                className={css`
                  margin-right: 1rem;
                `}
                icon={<SvgEmailFilled aria-hidden />}
                size="medium"
                variant="secondary"
              >
                Kontakt team
              </Button>
              <Button icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                Bli varslet
              </Button>
            </div>
          </div>

          <div
            className={css`
              display: grid;
              grid-template-columns: 0.6fr 0.4fr 0.4fr;
              grid-column-gap: 2rem;
              margin-top: 2rem;
            `}
          >
            <DescriptionSection header="Om oss" text={<Markdown source={team.description} />} />
            <ShortSummarySection
              clusters={clusters}
              contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
              productArea={productArea}
              team={team}
            />
            <LocationSection
              contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
              productArea={productArea}
              team={{ ...team, contactPersonResource: contactPersonResource }}
            />
          </div>

          <LargeDivider />

          <div>
            <div
              className={css`
                display: flex;
                justify-content: space-between;
                margin-bottom: 2rem;
              `}
            >
              <div
                className={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <Heading
                  className={css`
                    margin-right: 2rem;
                    margin-top: 0;
                  `}
                  size="medium"
                >
                  Medlemmer ({team.members.length > 0 ? team.members.length : "0"})
                </Heading>
                <Heading
                  className={css`
                    margin-top: 0;
                    align-self: center;
                  `}
                  size="small"
                >
                  Eksterne {getExternalLength()} (
                  {getExternalLength() > 0 ? ((getExternalLength() / team.members.length) * 100).toFixed(0) : "0"}
                  %)
                </Heading>
              </div>
              <div
                className={css`
                  display: flex;
                `}
              >
                <Button
                  className={css`
                    margin-right: 1rem;
                  `}
                  icon={<FileFilled />}
                  size="medium"
                  variant="secondary"
                >
                  Eksporter medlemmer
                </Button>
                <Button icon={<ListFilled />} size="medium" variant="secondary">
                  Tabellvisning
                </Button>
              </div>
            </div>
            {/* {!showTable ? <MembersNew members={team.members} /> : <MemberTable members={team.members} />} -- Når medlemstabell er klar*/}
            <Members members={team.members} />
          </div>
          <LargeDivider />

          <div
            className={css`
              margin-bottom: 3rem;
            `}
          >
            <Heading level="2" size="medium">
              Behandlinger i behandlingskatalogen ({processes.length})
            </Heading>

            <div
              className={css`
                margin-top: 2rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
              `}
            >
              {processes.length === 0 && <span>Ingen behandlinger registrert i behandlingskatalogen</span>}
              {processes
                .sort((a, b) => (a.purposeName + ": " + a.name).localeCompare(b.purposeName + ": " + b.name))
                .map((p) => (
                  <div
                    className={css`
                      margin-top: 10px;
                    `}
                    key={p.id}
                  >
                    <a
                      className={theme.linkWithUnderline}
                      href={processLink(p)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {p.purposeName + ": " + p.name}
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamPage;
