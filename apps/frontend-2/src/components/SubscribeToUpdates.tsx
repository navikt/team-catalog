/* eslint-disable unicorn/no-null */
import { css } from "@emotion/css";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Button, Chips, Label, Popover, Radio, RadioGroup } from "@navikt/ds-react";
import PopoverContent from "@navikt/ds-react/esm/popover/PopoverContent";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";

import type { NotificationChannel, NotificationType } from "../api/notificationApi";
import {
  FREQUENCY_OPTIONS,
  getNotifications,
  NOTIFICATION_CHANNEL_OPTIONS,
  NotificationTime,
  saveNotification,
} from "../api/notificationApi";
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

  const [selectedFrequency, setSelectedFrequency] = useState<NotificationTime | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([]);
  const { ident } = useUser();

  const existingNotification = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (notifications) => {
      const filtered = notifications.data.content.filter((notification) => notification.type === notificationType);

      return target ? filtered.find((notification) => notification.target === target) : filtered[0];
    },
    onSuccess: (notification) => {
      setSelectedFrequency(notification?.time ?? null);
      setSelectedChannels(notification?.channels ?? []);
    },
  });

  const saveNotificationMutation = useMutation(saveNotification, {
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onSuccess: () => setIsOpen(false),
  });

  if (!ident) {
    return <></>;
  }

  const canSubmit = !!selectedFrequency && selectedChannels.length > 0;

  return (
    <div>
      <Popover
        anchorEl={triggerReference.current}
        onClose={() => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          setIsOpen(false);
        }}
        open={isOpen}
        placement="bottom-end"
      >
        <PopoverContent
          className={css`
            display: flex;
            flex-direction: column;
            gap: 1rem;
          `}
        >
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
          {canSubmit && (
            <Button
              className={css`
                margin-top: 1rem;
              `}
              loading={saveNotificationMutation.isLoading}
              onClick={() => {
                saveNotificationMutation.mutate({
                  id: existingNotification.data?.id,
                  ident,
                  time: selectedFrequency ?? NotificationTime.ALL,
                  channels: selectedChannels,
                  type: notificationType,
                  target,
                });
              }}
            >
              Lagre
            </Button>
          )}
          <Link
            className={css`
              text-align: center;
            `}
            to="/user/notifications"
          >
            Se alle varslene mine
          </Link>
        </PopoverContent>
      </Popover>
      <Button
        icon={<SvgBellFilled aria-hidden />}
        onClick={() => setIsOpen(true)}
        ref={triggerReference}
        size="medium"
        variant="secondary"
      >
        {target ? "Bli varslet" : "Bli varslet om alle hendelser"}
      </Button>
    </div>
  );
}
