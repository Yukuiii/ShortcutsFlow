import { defineShortcut } from "@shortcutsflow/actions";
import { icon } from "@shortcutsflow/core";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.shortcuts),
  workflow: (shortcut) => {
    const message = shortcut.text("Hello from ShortcutsFlow");
    shortcut.showResult(message);
  },
});
