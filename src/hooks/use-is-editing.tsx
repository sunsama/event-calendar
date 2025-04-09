import React, {
  createContext,
  forwardRef,
  ReactNode,
  type Ref,
  useCallback,
  useContext,
  useState,
} from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { ConfigProvider } from "../utils/globals";
import { debounce, isFunction } from "lodash";
import {
  type CalendarEvent,
  EditStatus,
  type IsEditingProviderInnerMethods,
  PartDayEventLayoutType,
} from "../types";
import { useEvents } from "./use-events";
import moment from "moment-timezone";

interface IsEditingType<T extends CalendarEvent = CalendarEvent> {
  isEditing: null | PartDayEventLayoutType<T>;
  updateEditing: (top: number, height: number) => void;
  currentY: SharedValue<number>;
  setIsEditing: (
    newValue: PartDayEventLayoutType<T> | null,
    updatedTimes?: {
      updatedStart: string;
      updatedEnd: string;
    }
  ) => void;
  refMethods: Ref<IsEditingProviderInnerMethods<T>>;
}

const IsEditing = createContext<IsEditingType<any> | undefined>(undefined);

export const useIsEditing = () => {
  const context = useContext(IsEditing);

  if (!context) {
    throw new Error("useIsEditing must be used within a IsEditingProvider");
  }
  return context;
};

type IsEditingProviderInnerProps = {
  children: ReactNode;
};

const IsEditingProviderInner = <T extends CalendarEvent>(
  { children }: IsEditingProviderInnerProps,
  refMethods: Ref<IsEditingProviderInnerMethods<T>>
) => {
  const { canEditEvent, onEventEdit, updateLocalStateAfterEdit, timezone } =
    useContext(ConfigProvider);
  const { updateClonedEvents } = useEvents();
  const [isEditing, baseSetIsEditing] =
    useState<null | PartDayEventLayoutType<T>>(null);
  const currentY = useSharedValue(0);

  const updateEditing = debounce(
    (start: number, end: number) => {
      if (!isEditing) {
        return;
      }

      const newStart = moment
        .tz(isEditing.event.start, timezone)
        .startOf("day")
        .add(start, "minutes");
      const newEnd = moment
        .tz(isEditing.event.start, timezone)
        .startOf("day")
        .add(end, "minutes");

      onEventEdit?.({
        event: isEditing.event,
        status: EditStatus.Update,
        updatedTimes: {
          updatedStart: newStart.format(),
          updatedEnd: newEnd.format(),
        },
      });
    },
    500,
    { trailing: true }
  );

  const setIsEditing = useCallback(
    (
      newValue: PartDayEventLayoutType<T> | null,
      updatedTimes?: {
        updatedStart: string;
        updatedEnd: string;
      }
    ) => {
      if (newValue) {
        if (isEditing) {
          // Refuse to start a new edit
          return;
        }

        const canEditEventParsed = isFunction(canEditEvent)
          ? canEditEvent(newValue.event)
          : canEditEvent;

        if (!canEditEventParsed) {
          return;
        }

        onEventEdit?.({
          event: newValue.event,
          status: EditStatus.Start,
        });
      } else if (isEditing) {
        if (updateLocalStateAfterEdit) {
          updateClonedEvents((events) => {
            if (!updatedTimes) {
              // This means we removed the event
              return events.filter((event) => event.id !== isEditing.event.id);
            }

            return events.map((event) =>
              event.id === isEditing.event.id
                ? {
                    ...event,
                    start: updatedTimes?.updatedStart,
                    end: updatedTimes?.updatedEnd,
                  }
                : event
            );
          });
        }

        onEventEdit?.({
          event: isEditing.event,
          status: !updatedTimes ? EditStatus.Delete : EditStatus.Finish,
          updatedTimes,
        });
      }

      baseSetIsEditing(newValue);
    },
    [
      canEditEvent,
      isEditing,
      onEventEdit,
      updateClonedEvents,
      updateLocalStateAfterEdit,
    ]
  );

  return (
    <IsEditing.Provider
      value={{ currentY, isEditing, setIsEditing, updateEditing, refMethods }}
    >
      {children}
    </IsEditing.Provider>
  );
};

export const IsEditingProvider = forwardRef(IsEditingProviderInner) as <
  T extends CalendarEvent,
>(
  props: IsEditingProviderInnerProps & {
    ref?: Ref<IsEditingProviderInnerMethods<T>>;
  }
) => ReturnType<typeof IsEditingProviderInner>;
