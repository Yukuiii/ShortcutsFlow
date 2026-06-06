import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Get Dictionary Value Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const config = shortcut.dictionary({
      endpoint: "https://example.com",
      service: "shortcutsflow",
    });
    const endpoint = shortcut.getDictionaryValue(config, "endpoint");
    const key = shortcut.text("service");
    const service = shortcut.getDictionaryValue(config, key);

    shortcut.showResult(endpoint);
    shortcut.showResult(service);
  },
});
