import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Notification Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.notification("Build complete");

    const title = shortcut.text("ShortcutsFlow");
    const body = shortcut.text("Runtime notification body");
    shortcut.notification(title, body);
  },
});
