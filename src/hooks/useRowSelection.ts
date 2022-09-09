import { useState } from "react";

export function useRowSelection(rowCount: number) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const select = (index: number) => {
    if (index < 0 || index >= rowCount) {
      return;
    }
    setSelectedIndex(index);
  };

  return {
    selectedIndex,
    select,
    clear: () => setSelectedIndex(null),
  };
}
