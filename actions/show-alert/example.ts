import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Show Alert Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.showAlert("Static title", "Static message");

    const dynamicTitle = shortcut.text("Runtime title");
    const dynamicMessage = shortcut.text("Runtime message");

    shortcut.showAlert(dynamicTitle, dynamicMessage, {
      showCancelButton: false,
    });

    shortcut.showResult("Show Alert examples complete");
  },
});
