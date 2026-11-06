# LunarGarden

Sovereign biodynamic moon-phase planter. The calculation runs in your browser; nothing is sent to a server. LunarGarden translates lunar illumination data into actionable agricultural quarters and predicts when sap flows above and below ground, so growers can time their crop work to the lunar cycle.

**Live:** [garden.stormberry.as](https://garden.stormberry.as)

## Features
- **Astronomical quarters**: computes local lunar quarters (Leafy, Fruiting, Root, Maintenance) accurately from the device in real time.
- **Forecast timeline**: visually plots the exact boundary dates of the next four lunar phase-quarters across an upcoming full lunar cycle.
- **Native .ics export**: bundles future phase-quarters into a single `.ics` file for import into any major calendar app (Apple, Outlook, ProtonCalendar, etc.).
- **Sovereign sandbox**: pure HTML/CSS/JS, no external host resolvers, no REST APIs.

## Architecture
- **Vanilla HTML and CSS, TypeScript**, no frameworks.
- **TypeScript source in `ts/`, compiled JavaScript committed.** `ts/app.ts` compiles to `app.js`, a classic script as before, at the path the page has always loaded. `app.js` is committed because GitHub Pages serves the repository as it is, with no build step of its own; `.gitattributes` marks it as generated. Edit the TypeScript, never the `.js`. `suncalc.js` (SunCalc 1.8.0) is vendored byte for byte and not compiled; `ts/suncalc.d.ts` declares its types.
- **Build:** `npm run build` (`tools/build-ts.sh`) installs the pinned compiler (`npm ci`), compiles, then runs `bump_assets.py` to restamp the `?v=` cache stamps. `npm run check` changes nothing and fails when the committed JavaScript is not what the TypeScript compiles to. `npm test` runs the tests in `tests/` (Node 24). The published app has no runtime dependencies.
- **Privacy first**, zero external requests after page load, zero tracking, zero cookies.
- Stormberry dark-mode glassmorphism design system, Inter typography.
- **Sovereign AI**, built and maintained using high-speed agentic workflows.

## Stack
- [SunCalc](https://github.com/mourner/suncalc) for lunar position maths, bundled locally.
- [Inter](https://rsms.me/inter/) typeface, locally hosted.

## Credits
Built by [Stormberry AS](https://stormberry.as). Proudly powered by sovereign AI agents.

## Disclaimer

Supplied free of charge, **as is**, with no warranty of any kind. Using it creates no client or advisory relationship with Stormberry AS, and nothing it produces is professional advice.


This is a **functioning prototype**, not a certified instrument and not a professional service. Values are computed or modelled, not measured. Check anything that matters against an authoritative source before you act on it. Stormberry AS reimburses no cost or loss arising from use of this application.

Full terms: [DISCLAIMER.md](DISCLAIMER.md).
