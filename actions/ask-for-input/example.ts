import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Ask for Input Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const dynamicPrompt = shortcut.text("Enter a short note");

    const note = shortcut.askForInput(dynamicPrompt, {
      inputType: "Text",
      defaultAnswer: "Ready",
      allowMultipleLines: false,
    });

    const count = shortcut.askForInput({
      inputType: "Number",
      allowDecimal: false,
      allowNegative: false,
      defaultAnswer: "10",
    });

    const website = shortcut.askForInput("Enter a website", {
      inputType: "URL",
      defaultAnswer: "https://example.com",
    });

    const birthday = shortcut.askForInput("Choose a date", {
      inputType: "Date",
      defaultAnswer: "2026-01-01",
    });

    const reminderTime = shortcut.askForInput("Choose a date and time", {
      inputType: "Date and Time",
      defaultAnswer: "2026-01-01 12:00",
    });

    const alarmTime = shortcut.askForInput("Choose a time", {
      inputType: "Time",
      defaultAnswer: "12:00",
    });

    shortcut.comment("Text input");
    shortcut.showResult(note);
    shortcut.comment("Number input");
    shortcut.showResult(count);
    shortcut.comment("URL input");
    shortcut.showResult(website);
    shortcut.comment("Date input");
    shortcut.showResult(birthday);
    shortcut.comment("Date and time input");
    shortcut.showResult(reminderTime);
    shortcut.comment("Time input");
    shortcut.showResult(alarmTime);
  },
});
