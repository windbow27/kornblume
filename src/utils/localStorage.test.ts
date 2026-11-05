import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import {
  getKornblumeData,
  setGlobalLastModifiedTimestamp,
  setKornblumeData,
} from "./localStorage";
import { useArcanistOwnershipStore } from "@/stores/arcanistOwnershipStore";

describe("backup helpers", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const storage = new Map<string, string>();

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
    });
  });

  it("includes ownership data in exported backups", () => {
    localStorage.setItem("arcanistOwnership", '{"entries":[]}');

    const data = getKornblumeData();

    expect(data.arcanistOwnership).toBe('{"entries":[]}');
  });

  it("restores ownership data from imported backups", () => {
    const payload = {
      arcanistOwnership: '{"entries":[{"Id":1,"Name":"Test","isOwned":true}]}',
    };

    setKornblumeData(payload as Record<string, string>);

    expect(localStorage.getItem("arcanistOwnership")).toBe(
      payload.arcanistOwnership,
    );
  });

  it("updates the last modified timestamp when ownership changes", async () => {
    const onUpdate = vi.fn();
    const ownershipStore = useArcanistOwnershipStore();

    setGlobalLastModifiedTimestamp(onUpdate);
    ownershipStore.setOwned(1, "Test");
    await nextTick();

    expect(onUpdate).toHaveBeenCalledOnce();
    expect(localStorage.getItem("lastModified")).not.toBeNull();
  });
});
