import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import runtimeMessages from "@intlify/unplugin-vue-i18n/messages";

const i18n = createI18n({
  legacy: false,
  locale: "en-US",
  fallbackLocale: "en-US",
  missingWarn: false,
  fallbackWarn: false,
  messages: runtimeMessages,
});

const getPortraitLabel = (locale: string, portrait: number) => {
  i18n.global.locale.value = locale;
  return i18n.global.t("P{portrait}", { portrait });
};

describe("portrait label i18n interpolation", () => {
  it("renders localized portrait labels with a visible zero", () => {
    expect(getPortraitLabel("en-US", 0)).toBe("P0");
    expect(getPortraitLabel("ja-JP", 0)).toBe("0凸");
    expect(getPortraitLabel("ko-KR", 0)).toBe("0형상");
    expect(getPortraitLabel("zh-CN", 0)).toBe("0塑 ");
  });

  it("renders localized portrait labels with non-zero values", () => {
    expect(getPortraitLabel("en-US", 3)).toBe("P3");
    expect(getPortraitLabel("ja-JP", 3)).toBe("3凸");
    expect(getPortraitLabel("ko-KR", 3)).toBe("3형상");
    expect(getPortraitLabel("zh-CN", 3)).toBe("3塑 ");
  });
});
