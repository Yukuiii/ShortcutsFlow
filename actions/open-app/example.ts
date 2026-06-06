import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Open App Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.openApp("com.apple.shortcuts");
    shortcut.openApp({
      bundleIdentifier: "com.apple.shortcuts",
      name: "Shortcuts",
      teamIdentifier: "0000000000",
    });
  },
});
