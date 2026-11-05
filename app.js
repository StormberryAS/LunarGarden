"use strict";
/*! LunarGarden: app.js is compiled from ts/app.ts by tools/build-ts.sh, which leaves out every
    comment but this one: the explanations are in the source. Edit the .ts, never the .js: the build
    refuses to overwrite a hand edit, and its check mode fails on one. */
document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
    const phaseConfig = {
        0: {
            name: "New Moon (Waxing Crescent)",
            advice: "Plant above-ground leafy annuals (Lettuce, Spinach, Cabbage). High sap flow encourages leafy growth.",
            shortTask: "Plant leafy greens"
        },
        1: {
            name: "First Quarter (Waxing Gibbous)",
            advice: "Plant above-ground fruiting annuals (Tomatoes, Beans, Peppers). Strong moonlight promotes sturdy development.",
            shortTask: "Plant fruiting crops"
        },
        2: {
            name: "Full Moon (Waning Gibbous)",
            advice: "Plant root crops and perennials (Carrots, Onions, Trees). Sap flows downward, encouraging root growth.",
            shortTask: "Plant root crops"
        },
        3: {
            name: "Last Quarter (Waning Crescent)",
            advice: "Resting period. Optimal for pruning, weeding, pest control, and harvesting.",
            shortTask: "Prune, weed & harvest"
        }
    };
    const configOf = (quarter) => {
        const conf = phaseConfig[quarter];
        if (!conf)
            throw new Error(`no phase quarter ${quarter}`);
        return conf;
    };
    const byId = (id) => {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`missing #${id}`);
        return el;
    };
    const inCard = (card, selector) => {
        const el = card.querySelector(selector);
        if (!el)
            throw new Error(`missing ${selector} in #${card.id}`);
        return el;
    };
    const now = new Date();
    const currentIllum = SunCalc.getMoonIllumination(now);
    const currentPhaseVal = currentIllum.phase;
    const currentQuarter = Math.floor(currentPhaseVal * 4);
    const currentConfig = configOf(currentQuarter);
    byId('current-phase-name').textContent = currentConfig.name;
    byId('current-phase-illum').textContent = `${(currentPhaseVal * 100).toFixed(1)}% Cycle`;
    byId('current-task-desc').textContent = currentConfig.advice;
    let dateCursor = new Date(now);
    let trackingQuarter = currentQuarter;
    let phasesForecast = [];
    for (let d = 1; d <= 35; d++) {
        dateCursor.setDate(dateCursor.getDate() + 1);
        const ill = SunCalc.getMoonIllumination(dateCursor);
        const q = Math.floor(ill.phase * 4);
        if (q !== trackingQuarter) {
            phasesForecast.push({
                quarterType: q,
                startDate: new Date(dateCursor)
            });
            trackingQuarter = q;
            if (phasesForecast.length === 4)
                break;
        }
    }
    phasesForecast.forEach((phaseParams, index) => {
        const cardId = `card-${index}`;
        const cardEl = document.getElementById(cardId);
        if (!cardEl)
            return;
        const conf = configOf(phaseParams.quarterType);
        const startStr = phaseParams.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const endDate = new Date(phaseParams.startDate);
        endDate.setDate(endDate.getDate() + 7);
        const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        inCard(cardEl, '.phase-title').textContent = conf.name;
        inCard(cardEl, '.phase-date').textContent = `${startStr} \u2014 ${endStr}`;
        inCard(cardEl, '.phase-task').textContent = conf.advice;
    });
    byId('export-ics-btn').addEventListener('click', () => {
        let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Stormberry//LunarGarden//EN\r\n";
        phasesForecast.forEach((phaseParams) => {
            const conf = configOf(phaseParams.quarterType);
            const start = new Date(phaseParams.startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            const dtStart = start.toISOString().replace(/[-:]/g, "").slice(0, 8);
            const dtEnd = end.toISOString().replace(/[-:]/g, "").slice(0, 8);
            icsContent += "BEGIN:VEVENT\r\n";
            icsContent += `UID:${dtStart}-stormberry-lunargarden\r\n`;
            icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").substring(0, 15)}Z\r\n`;
            icsContent += `DTSTART;VALUE=DATE:${dtStart}\r\n`;
            icsContent += `DTEND;VALUE=DATE:${dtEnd}\r\n`;
            icsContent += `SUMMARY:Lunar Planting: ${conf.shortTask}\r\n`;
            icsContent += `DESCRIPTION:${conf.name}. ${conf.advice} (Computed entirely offline via locally hosted SunCalc astronomical algorithms by Stormberry AS)\r\n`;
            icsContent += "END:VEVENT\r\n";
        });
        icsContent += "END:VCALENDAR";
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Lunar_Planting_Forecast.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
