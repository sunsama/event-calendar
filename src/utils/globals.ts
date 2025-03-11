import { createContext } from "react";
import { Config } from "../types";

export const ConfigProvider = createContext<Config<any>>(undefined as never);

export const DEFAULT_MINUTE_HEIGHT = 0.8;
export const DEFAULT_MIN_ZOOM = 0.54;
export const DEFAULT_MAX_ZOOM = 3;
export const DEFAULT_MAX_ALL_DAY_EVENTS = 2;
export const DEFAULT_TIME_FORMAT = "HH:mm";
export const DEFAULT_TIMEZONE = "UTC";

export const TOP_MARGIN_PIXEL_OFFSET = 5;
export const MIN_EVENT_HEIGHT_PX = 24;
