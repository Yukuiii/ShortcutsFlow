import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Text Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const message = shortcut.text("Hello from ShortcutsFlow");
    const namedMessage = shortcut.setVariable("Message", message);
    const copiedMessage = shortcut.text(namedMessage);

    shortcut.showResult(message);
    shortcut.showResult(copiedMessage);
  },
});
