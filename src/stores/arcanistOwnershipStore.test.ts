import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useArcanistOwnershipStore } from "./arcanistOwnershipStore";
import { usePullsRecordStore, IPull } from "./pullsRecordStore";
import { useDataStore } from "./dataStore";
import type { IArcanist } from "@/types";

describe("useArcanistOwnershipStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("treats a manual entry as ownership and removes it when unchecked", () => {
    const store = useArcanistOwnershipStore();
    const pullsStore = usePullsRecordStore();
    const dataStore = useDataStore();

    dataStore.arcanists = [
      {
        Id: 1,
        Name: "Test Arcanist",
      } as IArcanist,
    ];

    const pulls: IPull[] = [
      {
        ArcanistName: "Test Arcanist",
        Rarity: 6,
        BannerType: "Standard",
        Timestamp: 0,
      },
    ];
    pullsStore.updatePullsRecord(pulls);

    store.setOwned(1, "Test Arcanist");

    const ownershipEntry = store.getEffectiveEntry(1);
    expect(ownershipEntry).toBeDefined();
    expect(ownershipEntry?.source).toBe("manual");

    store.removeEntry(1);
    const trackerEntry = store.getEffectiveEntry(1);
    expect(trackerEntry?.source).toBe("tracker");
    expect(trackerEntry?.portrait).toBe(0);
  });
});
