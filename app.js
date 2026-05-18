document.addEventListener("DOMContentLoaded", () => {
  // Set current year if element exists
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Biodynamic Configuration
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

  // 1. Calculate Current Phase
  const now = new Date();
  const currentIllum = SunCalc.getMoonIllumination(now);
  const currentPhaseVal = currentIllum.phase; // 0.0 to 1.0
  const currentQuarter = Math.floor(currentPhaseVal * 4);
  const currentConfig = phaseConfig[currentQuarter];

  // Update Hero UI
  document.getElementById('current-phase-name').textContent = currentConfig.name;
  document.getElementById('current-phase-illum').textContent = `${(currentPhaseVal * 100).toFixed(1)}% Cycle`;
  document.getElementById('current-task-desc').textContent = currentConfig.advice;

  // 2. Calculate Next 4 Phases
  let dateCursor = new Date(now);
  let trackingQuarter = currentQuarter;
  let phasesForecast = [];

  // Scan day by day for the next ~35 days to find all 4 phase transitions
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
      if (phasesForecast.length === 4) break;
    }
  }

  // 3. Render Timeline Cards
  phasesForecast.forEach((phaseParams, index) => {
    const cardId = `card-${index}`;
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;

    const conf = phaseConfig[phaseParams.quarterType];
    
    // Format start date and guess end date (approx 7 days)
    const startStr = phaseParams.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endDate = new Date(phaseParams.startDate);
    endDate.setDate(endDate.getDate() + 7);
    const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    cardEl.querySelector('.phase-title').textContent = conf.name;
    cardEl.querySelector('.phase-date').textContent = `${startStr} — ${endStr}`;
    cardEl.querySelector('.phase-task').textContent = conf.advice;
  });

  // 4. Calendar Export Logic (ICS)
  document.getElementById('export-ics-btn').addEventListener('click', () => {
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Stormberry//LunarGarden//EN\r\n";
    
    phasesForecast.forEach((phaseParams) => {
      const conf = phaseConfig[phaseParams.quarterType];
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

    // Download routine
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
