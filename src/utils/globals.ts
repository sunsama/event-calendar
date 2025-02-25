import { createContext } from "react";

export const ConfigProvider = createContext<Config>(undefined as never);

export const DEFAULT_MINUTE_HEIGHT = 0.8;

export const TOP_MARGIN_PIXEL_OFFSET = 5;
