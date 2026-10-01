import { defineStore } from "pinia";
import { useDataStore } from "@/stores/dataStore";
import { usePullsRecordStore } from "@/stores/pullsRecordStore";

export type OwnershipSource = "manual" | "tracker" | "none";

export interface IArcanistOwnershipEntry {
  Id: number;
  Name: string;
  level: number;
  insight: number;
  resonance: number;
  portrait: number;
  euphorias: number[];
  euphoriasEnabled: boolean[];
  source: OwnershipSource;
}

interface IArcanistOwnershipStoreState {
  entries: IArcanistOwnershipEntry[];
}

export const useArcanistOwnershipStore = defineStore("arcanistOwnership", {
  state: (): IArcanistOwnershipStoreState => ({
    entries: [],
  }),
  getters: {
    ownedIds: (state) => state.entries.map((entry) => entry.Id),
    getOwnedArcanists: (state) => state.entries,
  },
  actions: {
    getEntry(id: number): IArcanistOwnershipEntry | undefined {
      return this.entries.find((entry) => entry.Id === id);
    },
    getTrackerEntry(id: number): IArcanistOwnershipEntry | undefined {
      const pullsStore = usePullsRecordStore();
      const dataStore = useDataStore();
      const arcanist = dataStore.arcanists.find((arc) => arc.Id === id);
      if (!arcanist) {
        return undefined;
      }

      const pullCount = pullsStore.data.filter(
        (pull) => pull.ArcanistName === arcanist.Name,
      ).length;
      const portrait = pullCount > 0 ? pullCount - 1 : -1;
      if (portrait < 0) {
        return undefined;
      }

      return {
        Id: id,
        Name: arcanist.Name,
        level: 1,
        insight: 0,
        resonance: 1,
        portrait,
        euphorias: [],
        euphoriasEnabled: [],
        source: "tracker",
      };
    },
    getEffectiveEntry(id: number): IArcanistOwnershipEntry | undefined {
      const manualEntry = this.entries.find(
        (entry) => entry.Id === id && entry.source === "manual",
      );
      if (manualEntry) {
        return manualEntry;
      }

      return this.getTrackerEntry(id);
    },
    setOwned(id: number, name: string) {
      const trackerEntry = this.getTrackerEntry(id);
      this.entries = this.entries.filter(
        (entry) => entry.Id !== id || entry.source !== "manual",
      );

      this.entries.push({
        Id: id,
        Name: name,
        level: 1,
        insight: 0,
        resonance: 1,
        portrait: trackerEntry?.portrait ?? 0,
        euphorias: [],
        euphoriasEnabled: [],
        source: "manual",
      });
    },
    upsertEntry(entry: IArcanistOwnershipEntry) {
      const existing = this.entries.find(
        (item) => item.Id === entry.Id && item.source === entry.source,
      );
      if (existing) {
        Object.assign(existing, entry);
        return;
      }

      this.entries = this.entries.filter(
        (item) => item.Id !== entry.Id || item.source !== entry.source,
      );
      this.entries.push(entry);
    },
    updateEntry(id: number, updates: Partial<IArcanistOwnershipEntry>) {
      const existing = this.entries.find(
        (entry) => entry.Id === id && entry.source === "manual",
      );

      if (!existing) {
        this.entries = this.entries.filter(
          (entry) => entry.Id !== id || entry.source !== "manual",
        );
        this.entries.push({
          Id: id,
          Name: updates.Name ?? "",
          level: updates.level ?? 1,
          insight: updates.insight ?? 0,
          resonance: updates.resonance ?? 1,
          portrait: updates.portrait ?? 0,
          euphorias: Array.isArray(updates.euphorias)
            ? updates.euphorias
            : updates.euphorias !== undefined
              ? [updates.euphorias]
              : [],
          euphoriasEnabled: Array.isArray(updates.euphoriasEnabled)
            ? updates.euphoriasEnabled
            : updates.euphoriasEnabled !== undefined
              ? [updates.euphoriasEnabled]
              : [],
          source: "manual",
        });
        return;
      }

      Object.assign(existing, updates);
    },
    removeEntry(id: number) {
      this.entries = this.entries.filter((entry) => entry.Id !== id);
    },
    clear() {
      this.entries = [];
    },
  },
  persist: true,
});
