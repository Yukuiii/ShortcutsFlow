import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "If Examples",
  icon: icon.create(icon.color.blue, icon.glyph.apple),
  workflow: (shortcut) => {
    const message = shortcut.text("Hello");

    const ifResult = shortcut.if(shortcut.exists(message), {
      then: (shortcut) => {
        shortcut.showResult(message);
      },
      otherwise: (shortcut) => {
        shortcut.notification("No message");
      },
    });

    const result = shortcut.if(shortcut.equals(message, "Hello"), {
      then: (shortcut) => {
        shortcut.showResult(result);
      },
    });

    const result1 = shortcut.if(shortcut.equals(message, "Hello"), {
      then: (shortcut) => {
        const result2 = shortcut.if(shortcut.equals(message, "Hello"), {
          then: (shortcut) => {
            shortcut.showResult("Matched");
          },
          otherwise: (shortcut) => {
            shortcut.showResult("Not matched");
          },
        });

        shortcut.showResult(result2);
      },
      otherwise: (shortcut) => {
        shortcut.showResult("Not matched");
      },
    });

    shortcut.showResult(ifResult);

    shortcut.if(shortcut.equals(message, "Hello"), {
      then: (shortcut) => {
        shortcut.showAlert("Matched", message);
      },
    });

    shortcut.if(
      shortcut.all([
        message.contains("Hell"), // runtime value
        shortcut.endsWith(message, "lo"),
      ]),
      {
        then: (shortcut) => {
          shortcut.showResult("All conditions matched");
        },
      },
    );
  },
});
