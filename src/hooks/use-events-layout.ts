import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import generateEventLayouts from "../utils/generate-event-layouts";
import { useEffect } from "react";
import {
  CalendarEvent,
  CalendarViewIntervalType,
  FullCalendarEventLayout,
} from "../types";

type State = {
  events: FullCalendarEventLayout;
};

type Actions = {
  updateEvents: (props: UpdateEvent) => void;
};

export type UpdateEvent = {
  events: CalendarEvent[];
  userCalendarId: string;
  timezone: string;
  startCalendarDate: string;
  endCalendarDate: string;
  startDayOfWeekOffset?: number;
  calendarViewInterval?: CalendarViewIntervalType;
};

const useEventsLayoutStore = create<State & Actions>()(
  immer((set) => ({
    events: {
      allDayEventsLayout: [],
      partDayEventsLayout: [],
    },
    updateEvents: (props: UpdateEvent) =>
      set((state) => {
        state.events = generateEventLayouts(props)[props.startCalendarDate] || {
          partDayEventsLayout: [],
          allDayEventsLayout: [],
        };
      }),
  }))
);

const useEventsLayout = (props: UpdateEvent) => {
  const { events: layoutEvents } = useEventsLayoutStore();

  useEffect(() => {
    useEventsLayoutStore.getState().updateEvents(props);
  }, [props]);

  return layoutEvents;
};

export default useEventsLayout;
