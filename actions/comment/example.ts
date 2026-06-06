import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Comment Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.comment("Static comment text");

    const generatedText = shortcut.text("Runtime comment text");
    shortcut.comment(generatedText);

    const namedComment = shortcut.setVariable("Comment Text", generatedText);
    shortcut.comment(namedComment);

    shortcut.showResult("Comment examples complete");
  },
});
