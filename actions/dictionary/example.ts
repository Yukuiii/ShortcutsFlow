import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Dictionary Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const config = shortcut.dictionary({
      env: "dev",
      retries: 3,
      enabled: true,
      tags: ["alpha", "beta"],
      nested: {
        endpoint: "https://example.com",
      },
    });

    shortcut.showResult(config.get("env"));
    shortcut.showResult(config.get("nested"));
  },
});
