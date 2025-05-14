import { Alert, BodyShort, Box, Button, Modal } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";
import ReactDOM from "react-dom/client";

const REFETCH_WAIT_SECONDS = 16;

const spaHtmlWithoutNonce = {
  queryKey: () => ["getSpaHtmlWithoutNonce"],
  queryFn: async (): Promise<string> => {
    const spaHtmlResponse = await fetch(`/`);
    if (!spaHtmlResponse.status.toString().startsWith("2")) {
      throw { status: spaHtmlResponse.status };
    }
    const spaText = await spaHtmlResponse.text();
    return spaText.replaceAll(/nonce=\S+"/g, "");
  },
};

// Kan si at statisk HTML for en SPA implisitt gir versjon via "filnavn" i bundlet javascript og css.
export function useGetImplicitVersion() {
  return useQuery({
    queryKey: spaHtmlWithoutNonce.queryKey(),
    queryFn: spaHtmlWithoutNonce.queryFn,
    gcTime: REFETCH_WAIT_SECONDS * 1000,
    staleTime: REFETCH_WAIT_SECONDS * 1000,
    refetchInterval: REFETCH_WAIT_SECONDS * 1000,
    retry: 0,
  });
}

export function dialogHolder() {
  let close: () => void;
  let onCloseListeners: CallableFunction[] = [];

  return {
    closeDialog: () => close(),
    showDialog: (node: ReactNode) => {
      const dialogElement = document.createElement("dialog", {});
      document.body.append(dialogElement);
      close = () => dialogElement.close();

      const root = ReactDOM.createRoot(dialogElement);

      dialogElement.addEventListener("close", () => {
        root.unmount();
        dialogElement.remove();
        for (const listener of onCloseListeners) {
          listener();
        }
        onCloseListeners = [];
      });

      root.render(node);
      dialogElement.showModal();
    },
    addListener: (listener: CallableFunction) => {
      onCloseListeners.push(listener);
    },
  };
}

export function dynamicChooseActionMatrix(
  prompt: React.ReactNode,
  actions: { buttonText: string; onAction: () => void }[],
) {
  const di = dialogHolder();
  const promptIsString = typeof prompt === "string";
  return di.showDialog(
    <Box padding={"1"}>
      {promptIsString ? <BodyShort>{prompt}</BodyShort> : prompt}
      <Modal.Footer>
        {actions.map((action, index) => (
          <Button
            autoFocus={index === 0}
            key={action.buttonText}
            onClick={() => {
              di.closeDialog();
              action.onAction();
            }}
            variant={"secondary"}
          >
            {action.buttonText}
          </Button>
        ))}
      </Modal.Footer>
    </Box>,
  );
}

export function ExpiryNotifier() {
  const [showExpiredSession, setShowExpiredSession] = React.useState(false);
  const implicitSpaVersion = useGetImplicitVersion();

  React.useEffect(() => {
    const maybeErrorStatus = (implicitSpaVersion.error as { status?: string })?.status;
    const isAuthenticationOrAuthorizationError =
      implicitSpaVersion.isError && maybeErrorStatus && /^40[13]$/.test(maybeErrorStatus);

    if (isAuthenticationOrAuthorizationError) {
      setShowExpiredSession(true);
    }
  }, [implicitSpaVersion.isError]);

  React.useEffect(() => {
    if (showExpiredSession) {
      dynamicChooseActionMatrix(
        <div>
          <p style={{ fontSize: "140%" }}>Økten er utløpt</p>
          <p style={{ maxWidth: "35rem" }}>
            Det er ikke mulig å gjennomføre endringer eller laste inn oppdatert informasjon før ny økt er startet. Ny
            økt startes ved å laste inn siden på nytt.
          </p>
        </div>,
        [
          {
            buttonText: "Fortsett i utløpt økt",
            onAction: () => {},
          },
          {
            buttonText: "Last inn siden på nytt",
            onAction: () => globalThis.location.reload(),
          },
        ],
      );
    }
  }, [showExpiredSession]);
  return showExpiredSession ? <Alert variant="warning">Økten er utløpt</Alert> : null;
}
