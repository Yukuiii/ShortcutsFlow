import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Show Result Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.showResult("Static result text");

    const generatedText = shortcut.text("Runtime result text");
    shortcut.showResult(generatedText);

    const namedResult = shortcut.setVariable("Result Text", generatedText);
    shortcut.showResult(namedResult);
  },
});
