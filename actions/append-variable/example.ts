import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Append Variable Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const tasks = shortcut.appendVariable("Tasks", "Write documentation");
    const nextTask = shortcut.text("Run tests");

    shortcut.appendVariable("Tasks", nextTask);
    shortcut.showResult(tasks);
  },
});
