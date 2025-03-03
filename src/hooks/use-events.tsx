import {
  createContext,
  type Dispatch,
  ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cloneDeep } from "lodash";
import generateEventLayouts from "../utils/generate-event-layouts";
import {
  CalendarEvent,
  CalendarViewIntervalType,
  FullCalendarEventLayout,
} from "../types";

export type UpdateEvent<T extends CalendarEvent> = {
  events: T[];
  userCalendarId: string;
  timezone: string;
  startCalendarDate: string;
  endCalendarDate: string;
  startDayOfWeekOffset?: number;
  calendarViewInterval?: CalendarViewIntervalType;
};

type EventsContextType<T extends CalendarEvent> = {
  clonedEvents: T[];
  updateClonedEvents: Dispatch<SetStateAction<T[]>>;
  eventsLayout: FullCalendarEventLayout<T>;
  updateEventsLayout: (props: UpdateEvent<T>) => void;
};

// Context to store both cloned events & event layouts
const EventsContext = createContext<EventsContextType<any> | null>(null);

/**
 * Provider that manages both cloned events & event layouts independently.
 */
export const EventsProvider = <T extends CalendarEvent>({
  children,
  initialProps,
  updateLocalStateAfterEdit = true,
}: {
  children: ReactNode;
  initialProps: UpdateEvent<T>;
  updateLocalStateAfterEdit?: boolean;
}) => {
  // Cloned Events State
  const [clonedEvents, setClonedEvents] = useState<T[]>(initialProps.events);

  // Event Layouts State
  const [eventsLayout, setEventsLayout] = useState<FullCalendarEventLayout<T>>({
    allDayEventsLayout: [],
    partDayEventsLayout: [],
  });

  // Function to update cloned events
  const updateClonedEvents = useCallback(
    (events: T[]) => {
      setClonedEvents(updateLocalStateAfterEdit ? cloneDeep(events) : events);
    },
    [updateLocalStateAfterEdit]
  );

  // Function to update event layouts
  const updateEventsLayout = useCallback((props: UpdateEvent<T>) => {
    setEventsLayout(
      generateEventLayouts<T>(props)[props.startCalendarDate] || {
        partDayEventsLayout: [],
        allDayEventsLayout: [],
      }
    );
  }, []);

  // Update both states when initialProps change
  useEffect(() => {
    updateClonedEvents(initialProps.events);
    updateEventsLayout(initialProps);
  }, [initialProps, updateClonedEvents, updateEventsLayout]);

  useEffect(() => {
    updateEventsLayout({ ...initialProps, events: clonedEvents });
  }, [initialProps, clonedEvents, updateEventsLayout]);

  return (
    <EventsContext.Provider
      value={{
        clonedEvents,
        updateClonedEvents: setClonedEvents,
        eventsLayout,
        updateEventsLayout,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

/**
 * Hook to access cloned events and event layouts.
 */
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
