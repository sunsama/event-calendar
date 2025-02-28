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

interface IsEditingType {
  isEditing: null | PartDayEventLayoutType;
  currentY: SharedValue<number>;
  setIsEditing: (newValue: PartDayEventLayoutType | null) => void;
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
  const { canEditEvent } = useContext(ConfigProvider);
  const [isEditing, baseSetIsEditing] = useState<null | PartDayEventLayoutType>(
    null
  );
  const currentY = useSharedValue(0);

  const setIsEditing = useCallback(
    (newValue: PartDayEventLayoutType | null) => {
      if (newValue) {
        const canEditEventParsed = isFunction(canEditEvent)
          ? canEditEvent(newValue.event)
          : canEditEvent;

        if (!canEditEventParsed) {
          return;
        }
      }

      baseSetIsEditing(newValue);
    },
    [canEditEvent]
  );

  return (
    <IsEditing.Provider value={{ currentY, isEditing, setIsEditing }}>
      {children}
    </IsEditing.Provider>
  );
};
