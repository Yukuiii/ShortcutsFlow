import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Delay Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.delay(1);

    const seconds = shortcut.setVariable("Delay Seconds", 2);
    shortcut.delay(seconds);

    shortcut.showResult("Delay examples complete");
  },
});
