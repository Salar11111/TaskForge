/** Only the rows whose status/order actually changed need to be persisted. */
export function changedUpdates<T extends { id: string; status: string; order: number }>(
  next: T[],
  original: T[],
): Array<Pick<T, 'id' | 'status' | 'order'>> {
  const byId = new Map(original.map((t) => [t.id, t]));
  return next
    .filter((t) => {
      const prev = byId.get(t.id);
      return !prev || prev.status !== t.status || prev.order !== t.order;
    })
    .map((t) => ({ id: t.id, status: t.status, order: t.order }));
}
