import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    shortcut.comment("Generated from TypeScript with every public DSL action.");

    const config = shortcut.dictionary({
      env: "dev",
      retries: 3,
      enabled: true,
      encodedConfigUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbS9jb25maWcuanNvbg==",
      sampleJson: "{\"service\":\"shortcutsflow\",\"enabled\":true}",
      items: "alpha\nbeta\ngamma",
      searchText: "Cookie: session=abc123\nStatus: ok",
    });
    const message = shortcut.text("Hello from TypeScript");
    const messageVariable = shortcut.setVariable("Message", message);
    const encodedMessage = shortcut.base64Encode(messageVariable);
    const decodedMessage = shortcut.base64Decode(encodedMessage);
    const configUrlText = shortcut.base64Decode(config.get("encodedConfigUrl"));
    const configUrl = shortcut.url(configUrlText);
    const remoteConfig = shortcut.getContentsOfURL(configUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const detectedConfig = shortcut.detectDictionary(config.get("sampleJson"));
    const serviceName = detectedConfig.get("service");
    const itemText = shortcut.getDictionaryValue(config, "items");
    const itemList = shortcut.splitText(itemText, {
      separator: "New Lines",
    });
    const selectedItem = shortcut.chooseFromList(itemList, {
      prompt: "Choose an item",
    });
    const firstItem = shortcut.getItemFromList(itemList, {
      mode: "first",
    });
    const searchText = shortcut.getDictionaryValue(config, "searchText");
    const matches = shortcut.matchText(searchText, "session=([a-z0-9]+)");
    const firstMatch = shortcut.getItemFromList(matches, {
      mode: "first",
    });
    const normalizedMessage = shortcut.replaceText(
      decodedMessage,
      "TypeScript",
      "ShortcutsFlow",
    );
    const note = shortcut.askForInput("Add an optional note", {
      defaultAnswer: "Looks good",
    });
    const actionLog = shortcut.appendVariable("Action Log", normalizedMessage);

    shortcut.appendVariable("Action Log", selectedItem);
    shortcut.delay(1);

    shortcut.when(shortcut.exists(messageVariable), (shortcut) => {
      shortcut.notification("Build complete", messageVariable);
    });

    shortcut.if(shortcut.equals(selectedItem, firstItem), {
      then: (shortcut) => {
        shortcut.comment("The selected item matches the first list item.");
        shortcut.showResult(firstMatch);
      },
      otherwise: (shortcut) => {
        shortcut.comment("The selected item differs from the first list item.");
        shortcut.showResult(selectedItem);
      },
    });

    shortcut.repeatEach(itemList, (shortcut) => {
      shortcut.comment("Repeat body placeholder.");
    });

    shortcut.chooseFromMenu("Choose next action", {
      "Show Message": (shortcut) => {
        shortcut.showResult(normalizedMessage);
      },
      "Open Website": (shortcut) => {
        shortcut.openURL(configUrl);
      },
      "Open Shortcuts": (shortcut) => {
        shortcut.openApp({
          bundleIdentifier: "com.apple.shortcuts",
          name: "Shortcuts",
        });
      },
    });

    shortcut.showResult(serviceName);
    shortcut.showResult(remoteConfig);
    shortcut.showResult(note);
    shortcut.showResult(actionLog);
  },
});
