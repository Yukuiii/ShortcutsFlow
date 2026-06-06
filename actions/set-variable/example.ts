import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Set Variable Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const emptyValue = shortcut.setVariable("Message");
    const message = shortcut.text("Hello from ShortcutsFlow");
    const namedMessage = shortcut.setVariable("Message", message);
    const status = shortcut.variable("Status", "Pending");

    status.set("Running");
    status.append("Done");

    shortcut.showResult(emptyValue);
    shortcut.showResult(namedMessage);
    shortcut.showResult(status);
  },
});
