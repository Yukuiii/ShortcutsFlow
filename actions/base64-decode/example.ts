import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Base64 Decode Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const decodedLiteral = shortcut.base64Decode("SGVsbG8=");
    const encoded = shortcut.text("U2hvcnRjdXRzRmxvdw==");
    const decodedOutput = shortcut.base64Decode(encoded);

    shortcut.showResult(decodedLiteral);
    shortcut.showResult(decodedOutput);
  },
});
