/**
 * Tells us if an event extends into the next day, the previous day, or both.
 * Used for all day events.
 */
export enum EventExtend {
  // Keep None as value 0
  None,
  Past,
  Future,
  Both,
}

export enum EditStatus {
  Start,
  Finish,
}
