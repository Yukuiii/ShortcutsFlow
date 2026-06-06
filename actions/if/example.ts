import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "If Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const message = shortcut.text("Hello");

    shortcut.if(shortcut.exists(message), {
      then: (shortcut) => {
        shortcut.showResult(message);
      },
      otherwise: (shortcut) => {
        shortcut.notification("No message");
      },
    });

    shortcut.if(shortcut.equals(message, "Hello"), {
      then: (shortcut) => {
        shortcut.showAlert("Matched", message);
      },
    });
  },
});
