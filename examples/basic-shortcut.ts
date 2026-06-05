import { defineShortcut } from "@shortcutsflow/actions";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: {
    color: "blue",
    glyph: "shortcut",
  },
  workflow: (shortcut) => {
    shortcut.comment("Generated from TypeScript.");

    const config = shortcut.dictionary({
      env: "dev",
      retries: 3,
      enabled: true,
      encodedConfigUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbS9jb25maWcuanNvbg==",
    });
    const message = shortcut.text("Hello from TypeScript");
    const shortcutUrl = shortcut.url("https://www.icloud.com/shortcuts");
    const encodedConfigUrl = shortcut.getValueForKey(config, "encodedConfigUrl");
    const configUrl = shortcut.base64Decode(encodedConfigUrl);
    const remoteConfig = shortcut.getContentsOfURL(configUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    shortcut.if(shortcut.exists(message), {
      then: (shortcut) => {
        shortcut.notification("Build complete", message);
      },
      otherwise: (shortcut) => {
        shortcut.notification("Missing message");
      },
    });

    shortcut.chooseFromMenu("Choose next action", {
      "Show Message": (shortcut) => {
        shortcut.showResult(message);
      },
      "Open Shortcuts": (shortcut) => {
        shortcut.openURL(shortcutUrl);
      },
    });

    shortcut.if(shortcut.equals(message, "Hello from TypeScript"), {
      then: (shortcut) => {
        shortcut.comment("The generated message matches the expected text.");
      },
    });

    shortcut.repeatEach(config, (shortcut) => {
      shortcut.comment("Repeat body placeholder.");
    });

    shortcut.showResult(remoteConfig);
  },
});
