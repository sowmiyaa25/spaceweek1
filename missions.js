/* =====================================================
   SPACE WEEK 2026 — missions.js
   ALL mission text lives here. Edit the words, answers and XP freely.

   Step types:
     "briefing" – story text typed out, then a button
     "decision" – optional telemetry/clue + choices (correct: true marks the right one)
     "decode"   – a coded message and a typed answer (matched against "keywords")
   ===================================================== */

const MISSION = {
  title: "MISSION CONTROL: THE SILENT SATELLITE",
  icon: "🛰️",
  completeLine: "SATELLITE COMMUNICATION RESTORED",
  completionXp: 150,

  // Shown on the final screen so students leave with the key ideas.
  // Delete the items (leave []) to hide this section.
  recap: [
    "Engineers diagnose a spacecraft by reading telemetry: power, temperature, orbit, communication and camera.",
    "A weak signal can mean the antenna is not pointing at Earth, so the satellite must be re-oriented to talk to us.",
    "Earth-observation satellites watch our planet to monitor weather, climate, oceans and land."
  ],

  steps: [
    {
      type: "briefing",
      heading: "INCOMING TRANSMISSION",
      lines: [
        "Mission Control has detected a communication failure from an Earth-observation satellite.",
        "The spacecraft remains in orbit, but new images are no longer reaching Earth.",
        "Your team has been assigned to investigate the problem."
      ],
      objective: "RESTORE SATELLITE COMMUNICATION.",
      button: "ACCEPT MISSION",
      xp: 50
    },
    {
      type: "decision",
      telemetry: [
        { label: "POWER",         icon: "🟢", status: "NORMAL" },
        { label: "TEMPERATURE",   icon: "🟢", status: "NORMAL" },
        { label: "ORBIT",         icon: "🟢", status: "STABLE" },
        { label: "COMMUNICATION", icon: "🔴", status: "WEAK" },
        { label: "CAMERA",        icon: "🟡", status: "UNKNOWN" }
      ],
      question: "What do you investigate first?",
      options: [
        { text: "POWER" },
        { text: "COMMUNICATION", correct: true },
        { text: "ORBIT" },
        { text: "CAMERA" }
      ],
      goodCall: "GOOD CALL, CADET.",
      xp: 100
    },
    {
      type: "decision",
      clue: [
        "The satellite's communication signal is extremely weak.",
        "Engineers suspect the spacecraft's main communication antenna may not be correctly oriented toward Earth."
      ],
      question: "What should Mission Control attempt first?",
      options: [
        { text: "REORIENT THE SATELLITE TOWARD EARTH", correct: true },
        { text: "SWITCH OFF THE SATELLITE" },
        { text: "CHANGE THE ORBIT" },
        { text: "SHUT DOWN THE CAMERA" }
      ],
      goodCall: "ANTENNA ALIGNED. SIGNAL STRENGTHENING.",
      xp: 100
    },
    {
      type: "decode",
      heading: "DECODE THE TRANSMISSION",
      instruction: "The satellite is sending its purpose as a coded message. Every letter has been shifted 3 places forward in the alphabet (A became D). Shift each letter back by 3 to read it.",
      cipher: "REVHUYH HDUWK",
      plaintext: "OBSERVE EARTH",
      question: "In your own words: what is the job of an Earth-observation satellite?",
      keywords: ["earth", "observe", "observ", "monitor", "weather", "climate", "image", "photo", "map", "forecast", "disaster", "ocean", "land", "watch"],
      hint: "Think about what the satellite looks at, and what the images are used for.",
      xp: 100
    }
  ]
};
