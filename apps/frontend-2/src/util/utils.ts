export const mapToOptions = (list: { id: string; name: string }[] | undefined) => {
  return (list ?? []).map((po) => ({ value: po.id, label: po.name }));
};
