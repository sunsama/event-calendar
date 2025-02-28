import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { ConfigProvider } from "src/utils/globals";
import { isFunction } from "lodash";
import { EditStatus } from "src/enums";

interface IsEditingType {
  isEditing: null | PartDayEventLayoutType;
  currentY: SharedValue<number>;
  setIsEditing: (
    newValue: PartDayEventLayoutType | null,
    updatedTimes?: {
      updatedStart: string;
      updatedEnd: string;
    }
  ) => void;
}

const IsEditing = createContext<IsEditingType | undefined>(undefined);

export const useIsEditing = () => {
  const context = useContext(IsEditing);

  if (!context) {
    throw new Error("useIsEditing must be used within a IsEditingProvider");
  }
  return context;
};

// Provider component
export const IsEditingProvider = ({ children }: { children: ReactNode }) => {
  const { canEditEvent, onEventEdit } = useContext(ConfigProvider);
  const [isEditing, baseSetIsEditing] = useState<null | PartDayEventLayoutType>(
    null
  );
  const currentY = useSharedValue(0);

  const setIsEditing = useCallback(
    (
      newValue: PartDayEventLayoutType | null,
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
        onEventEdit?.({
          event: isEditing.event,
          status: EditStatus.Finish,
          updatedTimes,
        });
      }

      baseSetIsEditing(newValue);
    },
    [canEditEvent, isEditing, onEventEdit]
  );

  return (
    <IsEditing.Provider value={{ currentY, isEditing, setIsEditing }}>
      {children}
    </IsEditing.Provider>
  );
};
