import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Get Contents of URL Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const minimalResponse = shortcut.getContentsOfURL("https://example.com/config.json");
    const endpoint = shortcut.url("https://example.com/api");
    const responseWithHeaders = shortcut.getContentsOfURL(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    shortcut.showResult(minimalResponse);
    shortcut.showResult(responseWithHeaders);
  },
});
