import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Chips, Label, Popover, Radio, RadioGroup } from "@navikt/ds-react";
import PopoverContent from "@navikt/ds-react/esm/popover/PopoverContent";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import type { NotificationType } from "../api/notificationApi";
import { getNotifications, NotificationChannel, NotificationTime, saveNotification } from "../api/notificationApi";
import { useUser } from "../hooks";

export function SubscribeToUpdates({
  notificationType,
  target,
}: {
  notificationType: NotificationType;
  target?: string;
}) {
  const queryClient = useQueryClient();
  const triggerReference = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<NotificationTime>(NotificationTime.ALL);
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([]);
  const { ident } = useUser();

  useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (notifications) => {
      return notifications.data.content.find((notification) => notification.target === target);
    },
    onSuccess: (notification) => {
      setSelectedFrequency(notification?.time ?? NotificationTime.ALL);
      setSelectedChannels(notification?.channels ?? []);
    },
  });

  const saveNotificationMutation = useMutation(saveNotification, {
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!ident) {
    return <></>;
  }

  return (
    <div>
      <Popover
        anchorEl={triggerReference.current}
        onClose={() => setIsOpen(false)}
        open={isOpen}
        placement="bottom-end"
      >
        <PopoverContent>
          <RadioGroup
            legend="Hvor ofte vil du bli varslet?"
            onChange={(value: NotificationTime) => setSelectedFrequency(value)}
            value={selectedFrequency}
          >
            {Object.entries(FREQUENCY_OPTIONS).map(([notificationTime, description]) => (
              <Radio key={notificationTime} value={notificationTime}>
                {description}
              </Radio>
            ))}
          </RadioGroup>
          <Label>Hvor vil du bli varslet? Du kan velge begge.</Label>
          <Chips>
            {Object.entries(NOTIFICATION_CHANNEL_OPTIONS).map(([notificationChannel, description]) => (
              <Chips.Toggle
                key={notificationChannel}
                onClick={() => {
                  if (selectedChannels.includes(notificationChannel as NotificationChannel)) {
                    setSelectedChannels(selectedChannels.filter((channel) => channel !== notificationChannel));
                  } else {
                    setSelectedChannels([...selectedChannels, notificationChannel as NotificationChannel]);
                  }
                }}
                selected={selectedChannels.includes(notificationChannel as NotificationChannel)}
              >
                {description}
              </Chips.Toggle>
            ))}
          </Chips>
          <Button
            onClick={() => {
              saveNotificationMutation.mutate({
                ident,
                time: selectedFrequency,
                channels: selectedChannels,
                type: notificationType,
                target,
              });
            }}
          >
            Lagre
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        icon={<SvgBellFilled aria-hidden />}
        onClick={() => setIsOpen(true)}
        ref={triggerReference}
        size="medium"
        variant="secondary"
      >
        Bli varslet
      </Button>
    </div>
  );
}

const NOTIFICATION_CHANNEL_OPTIONS = {
  [NotificationChannel.SLACK]: "Slack",
  [NotificationChannel.EMAIL]: "E-post",
};

const FREQUENCY_OPTIONS = {
  [NotificationTime.ALL]: "Kontinuerlig",
  [NotificationTime.DAILY]: "Dalig",
  [NotificationTime.WEEKLY]: "Ukentlig",
  [NotificationTime.MONTHLY]: "Månedlig",
};
