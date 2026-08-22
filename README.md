# LunarGarden

Sovereign, fully-offline biodynamic moon-phase planter. LunarGarden translates lunar illumination data into actionable agricultural quarters and predicts when sap flows above and below ground, so growers can time their crop work to the lunar cycle.

**Live:** [garden.stormberry.as](https://garden.stormberry.as)

## Features
- **Astronomical quarters**: computes local lunar quarters (Leafy, Fruiting, Root, Maintenance) accurately from the device in real time.
- **Forecast timeline**: visually plots the exact boundary dates of the next four lunar phase-quarters across an upcoming full lunar cycle.
- **Native .ics export**: bundles future phase-quarters into a single `.ics` file for import into any major calendar app (Apple, Outlook, ProtonCalendar, etc.).
- **Sovereign sandbox**: pure HTML/CSS/JS, no external host resolvers, no REST APIs.

## Architecture
- **Vanilla HTML/CSS/JS**, no frameworks, no build step.
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
