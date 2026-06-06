import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Replace Text Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const literal = shortcut.replaceText("hello world", "world", "ShortcutsFlow");
    const input = shortcut.text("runtime world");
    const find = shortcut.text("world");
    const replacement = shortcut.text("ShortcutsFlow");
    const output = shortcut.replaceText(input, find, replacement);

    shortcut.showResult(literal);
    shortcut.showResult(output);
  },
});
