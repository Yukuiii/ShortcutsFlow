import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "URL Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const website = shortcut.url("https://www.icloud.com/shortcuts");
    const runtimeText = shortcut.text("https://www.apple.com");
    const runtimeURL = shortcut.url(runtimeText);

    shortcut.showResult(website);
    shortcut.openURL(runtimeURL);
  },
});
