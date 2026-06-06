import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Match Text Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const literalMatches = shortcut.matchText("Cookie: abc", "Cookie: (.+)");
    const input = shortcut.text("Status: ok");
    const pattern = shortcut.text("Status: (.+)");
    const outputMatches = shortcut.matchText(input, pattern);

    shortcut.showResult(literalMatches);
    shortcut.showResult(outputMatches);
  },
});
