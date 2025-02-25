import { create } from "zustand";

/**
 * Tells us if we are currently editing an event.
 * Either false or the id of the event being edited.
 */
const useIsEditing = create<false | string>(() => false);

export default useIsEditing;
