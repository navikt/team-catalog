import { css } from "@emotion/css";
import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, Table } from "@navikt/ds-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";

import { getProductArea, getTeam } from "../api";
import type { Notification } from "../api/notificationApi";
import {
  deleteNotification,
  FREQUENCY_OPTIONS,
  getNotifications,
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
  NotificationType,
} from "../api/notificationApi";
import { SubscribeToUpdates } from "../components/SubscribeToUpdates";

export function NotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (notifications) => {
      return notifications.data.content;
    },
  });

  const notifications = notificationsQuery.data ?? [];

  return (
    <div>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}
      >
        <Heading level="1" size="large">
          Dine varsler
        </Heading>
        <SubscribeToUpdates notificationType={NotificationType.ALL_EVENTS} />
      </div>
      {notifications.length === 0 && <Alert variant="info">Du har ingen varsler</Alert>}
      {notifications.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Navn</Table.ColumnHeader>
              <Table.ColumnHeader>Frekvens</Table.ColumnHeader>
              <Table.ColumnHeader>Hvor</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {notifications.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  const queryClient = useQueryClient();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", notification.target],
    queryFn: () => getProductArea(notification.target as string),
    enabled: notification.type === NotificationType.PA,
  });

  const teamQuery = useQuery({
    queryKey: ["getTeam", notification.target],
    queryFn: () => getTeam(notification.target as string),
    enabled: notification.type === NotificationType.TEAM,
  });

  const deleteNotificationMutation = useMutation(deleteNotification, {
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notificationName = (productAreasQuery.data || teamQuery.data)?.name ?? "Alle hendelser";
  const url = getNotificationUrl(notification);

  const id = notification.id;

  return (
    <Table.Row>
      <Table.DataCell scope="row">{url ? <Link to={url}>{notificationName}</Link> : notificationName}</Table.DataCell>
      <Table.DataCell>{FREQUENCY_OPTIONS[notification.time]}</Table.DataCell>
      <Table.DataCell>
        {notification.channels.map((channel) => NOTIFICATION_CHANNEL_OPTIONS[channel]).join(" og ")}
      </Table.DataCell>
      <Table.DataCell>{NOTIFICATION_TYPE_OPTIONS[notification.type]}</Table.DataCell>
      <Table.DataCell>
        {id && (
          <Button
            icon={<TrashIcon aria-hidden />}
            onClick={() => deleteNotificationMutation.mutate(id)}
            size="small"
            variant="tertiary"
          />
        )}
      </Table.DataCell>
    </Table.Row>
  );
}

function getNotificationUrl(notification: Notification) {
  if (notification.type === NotificationType.PA) {
    return `/area/${notification.target}`;
  }
  if (notification.type === NotificationType.TEAM) {
    return `/team/${notification.target}`;
  }
}
