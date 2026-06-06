import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Open URL Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.openURL("https://www.apple.com");

    const website = shortcut.url("https://www.icloud.com/shortcuts");
    shortcut.openURL(website);
  },
});
