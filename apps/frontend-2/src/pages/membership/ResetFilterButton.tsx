import { Button } from "@navikt/ds-react";
import { useSearchParams } from "react-router-dom";

export function ResetFilterButton({ className }: { className: string }) {
  const [, setSearchParameters] = useSearchParams();

  return (
    <Button className={className} onClick={() => setSearchParameters()} size="small" variant="primary">
      Nullstill
    </Button>
  );
}
