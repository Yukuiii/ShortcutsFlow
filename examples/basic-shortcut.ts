import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.comment("Generated from TypeScript.");

    const config = shortcut.dictionary({
      env: "dev",
      retries: 3,
      enabled: true,
      encodedConfigUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbS9jb25maWcuanNvbg==",
    });
    const message = shortcut.text("Hello from TypeScript");
    const shortcutUrl = shortcut.url("https://www.baidu.com/");
    const configUrl = config.get("encodedConfigUrl").base64Decode();
    const remoteConfig = shortcut.getContentsOfURL(configUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    shortcut.when(message.exists(), (shortcut) => {
      shortcut.notification("Build complete", message);
    });

    shortcut.chooseFromMenu("Choose next action", {
      "Show Message": (shortcut) => {
        shortcut.showResult(message);
      },
      "Open Shortcuts": (shortcut) => {
        shortcut.openURL(shortcutUrl);
      },
    });

    shortcut.if(message.equals("Hello from TypeScript"), {
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
