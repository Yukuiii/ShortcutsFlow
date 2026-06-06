import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Detect Dictionary Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const config = shortcut.detectDictionary("{\"service\":\"shortcutsflow\"}");
    const response = shortcut.getContentsOfURL("https://example.com/config.json");
    const remoteConfig = shortcut.detectDictionary(response);

    shortcut.showResult(config.get("service"));
    shortcut.showResult(remoteConfig);
  },
});
