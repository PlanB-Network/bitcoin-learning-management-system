export const toggleSelection = (
  item: string,
  activeItems: Set<string>,
  setActiveItems: React.Dispatch<React.SetStateAction<Set<string>>>,
  availableItems?: string[],
) => {
  if (item === 'all') {
    setActiveItems(new Set(['all']));
  } else {
    const isSelected = activeItems.has(item);
    let newSelection = isSelected
      ? new Set([...activeItems].filter((i) => i !== item))
      : new Set([...activeItems].filter((i) => i !== 'all')).add(item);

    if (newSelection.size === 0) {
      newSelection = new Set(['all']);
    }

    setActiveItems(newSelection);

    if (availableItems && newSelection.size === availableItems.length) {
      setActiveItems(new Set(['all']));
    }
  }
};

export const createToggleSelection =
  (
    activeItems: Set<string>,
    setActiveItems: React.Dispatch<React.SetStateAction<Set<string>>>,
    availableItems?: string[],
  ) =>
  (item: string) => {
    toggleSelection(item, activeItems, setActiveItems, availableItems);
  };
