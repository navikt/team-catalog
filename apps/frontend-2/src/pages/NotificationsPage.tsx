import { Heading } from "@navikt/ds-react";
import { useQuery } from "react-query";

import { getNotifications, NotificationType } from "../api/notificationApi";
import { SubscribeToUpdates } from "../components/SubscribeToUpdates";

export function NotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (notifications) => {
      return notifications.data.content;
    },
  });

  return (
    <div>
      <Heading level="1" size="large">
        Dine varsler
      </Heading>
      <SubscribeToUpdates notificationType={NotificationType.ALL_EVENTS} />
    </div>
  );
}
