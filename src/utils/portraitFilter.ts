export const PortraitFilterOperations = {
  Equals: "=",
  LessThan: "<",
  GreaterThan: ">",
} as const;

export type PortraitOperation =
  (typeof PortraitFilterOperations)[keyof typeof PortraitFilterOperations];

export const matchesPortrait = (
  value: number,
  operation: PortraitOperation,
  selectedPortraits: number[],
  selectedPortrait: number | null,
) => {
  if (operation === PortraitFilterOperations.Equals) {
    return (
      selectedPortraits.length === 0 || selectedPortraits.includes(value)
    );
  }

  if (selectedPortrait === null) {
    return true;
  }
  if (operation === PortraitFilterOperations.LessThan) {
    return value < selectedPortrait;
  }
  return value > selectedPortrait;
};

export const isPortraitOptionDisabled = (
  count: number,
  operation: PortraitOperation,
) =>
  (operation === PortraitFilterOperations.LessThan && count === 0) ||
  (operation === PortraitFilterOperations.GreaterThan && count === 5);
