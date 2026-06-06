import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Get Item from List Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const items = shortcut.text("one,two,three");
    const first = shortcut.getItemFromList(items);
    const last = shortcut.getItemFromList(items, {
      mode: "last",
    });
    const random = shortcut.getItemFromList(items, {
      mode: "random",
    });
    const rangeStart = shortcut.setVariable("Range Start", 1);
    const range = shortcut.getItemFromList(items, {
      mode: "range",
      start: rangeStart,
    });

    shortcut.showResult(first);
    shortcut.showResult(last);
    shortcut.showResult(random);
    shortcut.showResult(range);
  },
});
