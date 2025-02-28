import computePositioning from "src/utils/compute-positioning";
import moment from "moment-timezone";

describe("computePositioning", () => {
  it("should compute positioning correctly without collisions", () => {
    const layout: PartDayEventLayoutType = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "100%",
      marginLeft: "0%",
    });
  });

  it("should compute positioning correctly with collisions (total: 3, order: 0)", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      collisions: { total: 3, order: 0 },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "64%",
      marginLeft: "0%",
    });
  });

  it("should compute positioning correctly with collisions (total: 3, order: 1)", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      collisions: { total: 3, order: 1 },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "64%",
      marginLeft: "33.333333333333336%",
    });
  });

  it("should compute positioning correctly with collisions (total: 3, order: 2)", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      collisions: { total: 3, order: 2 },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "33.333333333333336%",
      marginLeft: "66.66666666666667%",
    });
  });

  it("should compute positioning correctly with collisions (total: 4, order: 3)", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      collisions: { total: 4, order: 3 },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "25%",
      marginLeft: "75%",
    });
  });

  it("should compute positioning correctly with collisions", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T10:00:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      collisions: { total: 2, order: 1 },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 60,
      width: "50%",
      marginLeft: "50%",
    });
  });

  it("should handle minimum height correctly", () => {
    const layout = {
      event: {
        start: "2023-10-01T09:00:00Z",
        end: "2023-10-01T09:15:00Z",
        id: "test",
        title: "",
        calendarId: "",
      },
      // We don't have to test this
      position: {
        top: 540,
        height: 60,
        width: "100%",
        marginLeft: "0%",
      },
    };
    const startOfDayMoment = moment
      .tz(layout.event.start, "UTC")
      .startOf("day");

    const result = computePositioning({
      collisionObject: layout,
      startOfDayMoment,
      timezone: "UTC",
    });

    expect(result).toEqual({
      top: 540,
      height: 30,
      width: "100%",
      marginLeft: "0%",
    });
  });
});
