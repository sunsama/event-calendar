import moment, { Moment } from "moment-timezone";

type ComputePositioning = {
  // We only need the collisions part of this type
  collisionObject: CollisionObject;
  startOfDayMoment: Moment;
  timezone: string;
};

const computePositioning = ({
  collisionObject,
  startOfDayMoment,
  timezone,
}: ComputePositioning): EventPosition => {
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
