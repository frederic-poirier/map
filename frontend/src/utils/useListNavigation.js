import { createSignal } from "solid-js";

/**
 * Hook réutilisable pour la navigation au clavier dans une liste
 * @param {Object} options
 * @param {() => any[]} options.items - Accessor qui retourne les items navigables
 * @param {(item: any, index: number) => void} options.onSelect - Callback quand un item est sélectionné
 * @param {Object} options.handlers - Handlers additionnels optionnels
 * @param {() => void} options.handlers.onEscape - Callback pour la touche Escape
 * @param {(item: any) => void} options.handlers.onTab - Callback pour la touche Tab
 * @param {boolean} options.wrap - Si true, wrap around au début/fin de la liste
 * @param {number} options.initialIndex - Index initial (default: -1)
 */
export default function useListNavigation(options) {
  const {
    items,
    onSelect,
    handlers = {},
    wrap = false,
    initialIndex = -1,
  } = options;

  const [selectedIndex, setSelectedIndex] = createSignal(initialIndex);

  const getItems = () => items() || [];

  const moveUp = () => {
    const list = getItems();
    if (list.length === 0) return;

    setSelectedIndex((i) => {
      if (i <= 0) {
        return wrap ? list.length - 1 : -1;
      }
      return i - 1;
    });
  };

  const moveDown = () => {
    const list = getItems();
    if (list.length === 0) return;

    setSelectedIndex((i) => {
      if (i >= list.length - 1) {
        return wrap ? 0 : list.length - 1;
      }
      return i + 1;
    });
  };


  const selectCurrent = () => {
    const list = getItems();
    const index = selectedIndex();

    if (index >= 0 && list[index]) {
      onSelect?.(list[index], index);
      return true;
    }
    return false;
  };

  const selectFirst = () => {
    const list = getItems();
    if (list.length > 0) {
      onSelect?.(list[0], 0);
      return true;
    }
    return false;
  };

  const reset = () => setSelectedIndex(initialIndex);
  const isSelected = (index) => selectedIndex() === index;
  const getSelectedItem = () => {
    const list = getItems();
    const index = selectedIndex();
    return list[index] || null;
  }

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveDown();
        break;

      case "ArrowUp":
        e.preventDefault();
        moveUp();
        break;

      case "Enter":
      case " ": // Space
        if (e.key === " " && e.target.tagName === "INPUT") break; // Don't hijack space in inputs
        e.preventDefault();
        if (!selectCurrent()) {
          selectFirst();
        }
        break;

      case "Tab":
        if (handlers.onTab) {
          const list = getItems();
          const index = selectedIndex();
          if (list.length > 0) {
            e.preventDefault();
            if (index === -1) {
              setSelectedIndex(0);
            } else if (list[index]) {
              handlers.onTab(list[index], index);
            }
          }
        }
        break;

      case "Escape":
        e.preventDefault();
        handlers.onEscape?.();
        break;
    }
  };

  return {
    // State
    selectedIndex,
    setSelectedIndex,

    // Actions
    moveUp,
    moveDown,
    selectCurrent,
    selectFirst,
    reset,
    getSelectedItem,

    // Helpers
    isSelected,
    handleKeyDown,
  };
}
