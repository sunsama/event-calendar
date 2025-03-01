import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { CalendarEvent } from "../types";

export let updateClonedEvents: Dispatch<SetStateAction<CalendarEvent[]>>;

/**
 * Returns a cloned version of the events array if the updateLocalStateAfterEdit is set to true.
 * We do this to make local state updates faster and more responsive. If the updateLocalStateAfterEdit is set to false,
 * we return the original events array and don't clone it.
 */
const useClonedEvents = (
  events: CalendarEvent[],
  updateLocalStateAfterEdit: boolean
) => {
  const [clonedEvents, setClonedEvents] = useState(events);

  useEffect(() => {
    setClonedEvents(updateLocalStateAfterEdit ? cloneDeep(events) : events);
    updateClonedEvents = setClonedEvents;
  }, [events, updateLocalStateAfterEdit]);

  return clonedEvents;
};

export default useClonedEvents;
