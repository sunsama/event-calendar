import {
  createContext,
  type Dispatch,
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

export type UpdateEvent = {
  events: CalendarEvent[];
  userCalendarId: string;
  timezone: string;
  startCalendarDate: string;
  endCalendarDate: string;
  startDayOfWeekOffset?: number;
  calendarViewInterval?: CalendarViewIntervalType;
};

type EventsContextType = {
  clonedEvents: CalendarEvent[];
  updateClonedEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  eventsLayout: FullCalendarEventLayout;
  updateEventsLayout: (props: UpdateEvent) => void;
};

// Context to store both cloned events & event layouts
const EventsContext = createContext<EventsContextType | null>(null);

/**
 * Provider that manages both cloned events & event layouts independently.
 */
export const EventsProvider = ({
  children,
  initialProps,
  updateLocalStateAfterEdit = true,
}: {
  children: React.ReactNode;
  initialProps: UpdateEvent;
  updateLocalStateAfterEdit?: boolean;
}) => {
  // Cloned Events State
  const [clonedEvents, setClonedEvents] = useState<CalendarEvent[]>(
    initialProps.events
  );

  // Event Layouts State
  const [eventsLayout, setEventsLayout] = useState<FullCalendarEventLayout>({
    allDayEventsLayout: [],
    partDayEventsLayout: [],
  });

  // Function to update cloned events
  const updateClonedEvents = useCallback(
    (events: CalendarEvent[]) => {
      setClonedEvents(updateLocalStateAfterEdit ? cloneDeep(events) : events);
    },
    [updateLocalStateAfterEdit]
  );

  // Function to update event layouts
  const updateEventsLayout = (props: UpdateEvent) => {
    setEventsLayout(
      generateEventLayouts(props)[props.startCalendarDate] || {
        partDayEventsLayout: [],
        allDayEventsLayout: [],
      }
    );
  };

  // Update both states when initialProps change
  useEffect(() => {
    updateClonedEvents(initialProps.events);
    updateEventsLayout(initialProps);
  }, [initialProps, updateClonedEvents]);

  useEffect(() => {
    updateEventsLayout({ ...initialProps, events: clonedEvents });
  }, [initialProps, clonedEvents]);

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
