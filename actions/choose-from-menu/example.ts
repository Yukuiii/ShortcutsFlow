import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Choose from Menu Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.chooseFromMenu("Choose next action", {
      "Show Result": (shortcut) => {
        shortcut.showResult("Menu selected Show Result");
      },
      "Show Alert": (shortcut) => {
        shortcut.showAlert("Menu", "Menu selected Show Alert");
      },
    });
  },
});
