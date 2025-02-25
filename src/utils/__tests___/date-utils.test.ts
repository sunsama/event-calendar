import moment from "moment-timezone";
import { generatePrefabHours } from "../date-utils";

describe("generatePrefabHours", () => {
  it("should generate 24 hours with default format", () => {
    const hours = generatePrefabHours();
    expect(hours.length).toBe(24);
    expect(hours[0]!.hourFormatted).toBe(
      moment().startOf("day").format("HH:mm")
    );
    expect(hours[23]!.hourFormatted).toBe(
      moment().startOf("day").hour(23).format("HH:mm")
    );
  });

  it("should generate 24 hours with US format", () => {
    const customFormat = "h A";
    const hours = generatePrefabHours(customFormat);
    expect(hours.length).toBe(24);
    expect(hours[0]!.hourFormatted).toBe(
      moment().startOf("day").format(customFormat)
    );
    expect(hours[23]!.hourFormatted).toBe(
      moment().startOf("day").hour(23).format(customFormat)
    );
  });

  it("should generate correct hour moments", () => {
    const hours = generatePrefabHours();
    hours.forEach((hour, index) => {
      expect(hour.hourMoment.hour()).toBe(index);
    });
  });

  it("should generate correct increments", () => {
    const hours = generatePrefabHours();
    hours.forEach((hour, index) => {
      expect(hour.increment).toBe(index);
    });
  });
});
