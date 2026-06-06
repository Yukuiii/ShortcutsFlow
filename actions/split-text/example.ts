import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Split Text Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const lines = shortcut.splitText("one\ntwo\nthree");
    const text = shortcut.text("one two three");
    const words = shortcut.splitText(text, {
      separator: "Spaces",
    });

    shortcut.showResult(lines);
    shortcut.showResult(words);
  },
});
