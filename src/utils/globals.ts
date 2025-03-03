import { createContext } from "react";
import { Config } from "../types";

export const ConfigProvider = createContext<Config<any>>(undefined as never);

export const DEFAULT_MINUTE_HEIGHT = 0.8;

export const TOP_MARGIN_PIXEL_OFFSET = 5;
