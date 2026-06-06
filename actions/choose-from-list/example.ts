import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Choose from List Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const selectedLiteral = shortcut.chooseFromList("dev,prod");
    const environments = shortcut.text("dev,staging,prod");
    const selectedOutput = shortcut.chooseFromList(environments, {
      prompt: "Choose an environment",
    });

    shortcut.showResult(selectedLiteral);
    shortcut.showResult(selectedOutput);
  },
});
