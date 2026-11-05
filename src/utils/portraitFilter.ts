export type PortraitOperation = "=" | "<" | ">";

export const matchesPortrait = (
  value: number,
  operation: PortraitOperation,
  selectedPortraits: number[],
  selectedPortrait: number | null,
) => {
  if (operation === "=") {
    return (
      selectedPortraits.length === 0 || selectedPortraits.includes(value)
    );
  }

  if (selectedPortrait === null) return true;
  if (operation === "<") return value < selectedPortrait;
  return value > selectedPortrait;
};

export const isPortraitOptionDisabled = (
  count: number,
  operation: PortraitOperation,
) =>
  (operation === "<" && count === 0) ||
  (operation === ">" && count === 5);
