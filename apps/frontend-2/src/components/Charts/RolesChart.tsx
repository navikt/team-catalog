import {css} from "@emotion/css";
import {Fragment} from "react";
import {createMemo} from "react-use";
import {Bar, BarChart, LabelList, XAxis, YAxis} from "recharts";

import type {Cluster, Member, ProductArea, ProductTeam} from "../../constants";
import {Status, TeamRole} from "../../constants";
import {useAllClusters} from "../../hooks";
import {useAllProductAreas} from "../../hooks";
import {useAllTeams} from "../../hooks";
import {intl} from "../../util/intl/intl";
import sortBy from "lodash/sortBy";
import {partition, sumBy} from "lodash";
import {useNavigate} from "react-router-dom";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

export function RolesChart() {
    const teams = useAllTeams({status: Status.ACTIVE});
    const areas = useAllProductAreas({status: Status.ACTIVE});
    const clusters = useAllClusters({status: Status.ACTIVE});

    const navigate = useNavigate();

    const memoizedData = useMemoTeamMembersData(teams.data ?? [], areas.data ?? [], clusters.data ?? []);
    console.log(memoizedData)
    if (memoizedData.length === 0) {
        return <></>;
    }

    return (
        <Fragment>
            <h2>Andel personer per rolle</h2>
            <div
                className={css`
                  background: #e6f1f8;
                  padding: 2rem;
                  width: max-content;
                  margin-bottom: 2rem;

                  .recharts-bar-rectangle {
                    cursor: pointer;
                  }
                `}
            >
                <BarChart
                    barCategoryGap={2}
                    barGap={4}
                    barSize={25}
                    data={memoizedData}
                    height={1200}
                    layout="vertical"
                    width={600}
                >
                    <Bar css={css`color: red; cursor: pointer;`} dataKey="numberOfMembers" fill="#005077" onClick={(event) => {
                        if (event.roleEnum) {
                            navigate(`/dashboard/members/role/${event.roleEnum}`)
                        }
                    }} radius={3}
                         width={30}>
                        <LabelList dataKey="numberOfMembers" position="right"/>
                    </Bar>
                    <XAxis hide type="number"/>
                    <YAxis axisLine={false} dataKey="role" tickLine={false} type="category" width={200}/>
                </BarChart>
            </div>
        </Fragment>
    );
}

function formatData(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
    const allMembers = getAllMembers(teams, areas, clusters);
    const sortedRoles = sortRoles(allMembers);

    const sortedRolesCombined = combineSmallValues(sortedRoles);

    return sortedRolesCombined.map((roleWithCount) => {
        return formatDataRow(roleWithCount, allMembers);
    });
}

function formatDataRow(row: ChartDataRow, allMembers: Member[]) {
    const percentage = Math.round((row.numberOfMembers / allMembers.length) * 100);

    return {
        ...row,
        roleText: `${row.role} (${percentage}%)`,
    };
}

type ChartDataRow = {
    role: string;
    enumRole?: TeamRole;
    numberOfMembers: number;
}

function combineSmallValues(
    dataRows: ChartDataRow[]
) {
    const [rows, rowsToBeSquashed] = partition(dataRows, row => row.numberOfMembers >= 30);

    if (rowsToBeSquashed.length > 0) {
        rows.push({
            role: "Diverse mindre roller",
            numberOfMembers: sumBy(rowsToBeSquashed, "numberOfMembers"),
        });
    }
    return rows;
}

function sortRoles(members: Member[]) {
    const enumRoles = Object.keys(TeamRole) as TeamRole[];
    const output = enumRoles.map((role) => {
        const numberOfMembersWithRole = members.filter((member) => member.roles.includes(role));
        return {role: intl[role], roleEnum: role, numberOfMembers: numberOfMembersWithRole.length};
    });

    return sortBy(output, "numberOfMembers");
}

function getAllMembers(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
    const teamMembers = teams.flatMap((team) => team.members);
    const areaMembers = areas.flatMap((area) => area.members);
    const clusterMembers = clusters.flatMap((cluster) => cluster.members);

    return [...teamMembers, ...areaMembers, ...clusterMembers];
}
