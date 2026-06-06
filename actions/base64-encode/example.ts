import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Base64 Encode Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const encodedLiteral = shortcut.base64Encode("Hello from ShortcutsFlow");
    const message = shortcut.text("Runtime message");
    const encodedOutput = shortcut.base64Encode(message);

    shortcut.showResult(encodedLiteral);
    shortcut.showResult(encodedOutput);
  },
});
