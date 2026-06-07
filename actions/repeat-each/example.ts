import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Repeat Each Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const items = shortcut.text("one,two,three");

    shortcut.repeatEach(items, (shortcut, item) => {
      shortcut.comment("Repeat body");
      shortcut.showResult(item);
    });
  },
});
