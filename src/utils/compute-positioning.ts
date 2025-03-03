import moment, { Moment } from "moment-timezone";
import { type CalendarEvent, CollisionObject, EventPosition } from "../types";

type ComputePositioning<T extends CalendarEvent> = {
  // We only need the collisions part of this type
  collisionObject: CollisionObject<T>;
  startOfDayMoment: Moment;
  timezone: string;
};

const computePositioning = <T extends CalendarEvent>({
  collisionObject,
  startOfDayMoment,
  timezone,
}: ComputePositioning<T>): EventPosition => {
  const startDateMoment = moment.tz(collisionObject.event.start, timezone);
  const durationMinutes = moment
    .tz(collisionObject.event.end, timezone)
    .diff(startDateMoment, "minutes");

  let width = 100;
  let margin = 0;

  const top = startDateMoment.diff(startOfDayMoment, "minutes");
  const height = Math.max(30, durationMinutes);
  const collisions = collisionObject.collisions;

  if (collisions) {
    margin = (100 / collisions.total) * collisions.order;
    width =
      collisions.order + 1 < collisions.total
        ? Math.max(100 - 12 * collisions.total, 20)
        : 100 / collisions.total;
  }

  return {
    top,
    height,
    width: `${width}%`,
    marginLeft: `${margin}%`,
  };
};

export default computePositioning;
