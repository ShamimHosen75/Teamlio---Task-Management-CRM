# Settings Appearance Controls

## Build
- Add an **Appearance** tab to Settings alongside Organisation, My profile, and Workflow.
- Add Light, Dark, and System appearance choices with persistent browser preferences.
- Add professional theme presets plus custom controls for the main button color, button text color, workspace text color, font family, and corner style.
- Show a live preview and provide Reset and Apply controls.
- Make preferences apply across the entire workspace and remain after refresh.
- Keep the controls compact, accessible, and responsive on phone and desktop.

## Technical details
- Store appearance preferences locally so each browser can keep its own presentation without changing organization data.
- Apply semantic CSS variables and font tokens at the document root; existing buttons and text inherit the chosen values.
- Extend the existing theme toggle to understand System mode and share the same saved preference.
- Load the selectable fonts in the document head and retain the current default appearance when no saved preference exists.

## Verification
- Confirm Light, Dark, and System modes apply correctly.
- Confirm button color, button text color, workspace text color, font, and radius update the live interface and survive reload.
- Confirm the new Settings tab is usable at phone and desktop sizes without overflow.
