import { css } from "@emotion/css";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { Alert, Button, Chips, Heading, Label, Modal, Radio, RadioGroup } from "@navikt/ds-react";
import { useState } from "react";
import { useMutation } from "react-query";

import type { NotificationType } from "../api/notificationApi";
import { NotificationChannel, NotificationTime, saveNotification } from "../api/notificationApi";
import { useUser } from "../hooks";

export function SubscribeToUpdates({ notificationType }: { notificationType: NotificationType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<NotificationTime>(NotificationTime.ALL);
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([]);
  const { ident } = useUser();

  const saveNotificationMutation = useMutation(saveNotification, {
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  if (!ident) {
    return <></>;
  }

  return (
    <div>
      <Modal
        className={css`
          width: 500px;
          padding: var(--a-spacing-8);
        `}
        onClose={() => setIsOpen(false)}
        open={isOpen}
      >
        <Modal.Content
          className={css`
            display: flex;
            flex-direction: column;
            gap: 1rem;
          `}
        >
          <Heading level="1" size="large" spacing>
            Bli varslet
          </Heading>
          <Alert variant="info">Du vil bli varslet...</Alert>
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
          <div
            className={css`
              margin-top: var(--a-spacing-8);
              display: flex;
              gap: var(--a-spacing-4);
              button {
                flex: 1;
              }
            `}
          >
            <Button
              onClick={() =>
                saveNotificationMutation.mutate({
                  ident,
                  time: selectedFrequency,
                  channels: selectedChannels,
                  type: notificationType,
                })
              }
            >
              Lagre
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="secondary">
              Avbryt
            </Button>
          </div>
        </Modal.Content>
      </Modal>

      <Button icon={<SvgBellFilled aria-hidden />} onClick={() => setIsOpen(true)} size="medium" variant="secondary">
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
