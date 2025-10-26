// STRATEGIC_PRIMER v3.0 - The Macro Playbook
// A timeline-based macro playbook for competitive League of Legends.
// Details key actions and responsibilities for each role across different game phases.
// Purpose: To serve as a granular, time-sensitive knowledge base for AI analysis and prompting.
export const STRATEGIC_PRIMER = `
Each block covers key phases, objective state, and role actions.
Time markers = approximate spawn/prep windows.

🧭 0–5 MIN — EARLY LANING & SETUP
Role	Focus	Checklist
Jungle	Route setup for first Scuttle & tempo toward Grubs.	- Path to be topside or botside based on Grub priority.
- Track enemy jungler pathing via wards or lane pressure.
- Sync first recall @3:30–4:00 to have control wards for Grub setup.
Top	Wave control and TP prep.	- Track jungler path.
- Avoid unnecessary trades if weak side.
- If strong side, set up wave push @4:00 for Grub move.
Mid	Lane prio → information flow.	- Crash wave before 4:30.
- Move to pixel bush for vision or cover river.
- Maintain tempo sync with jungle.
Bot (ADC)	Maintain pressure or crash for roam.	- Communicate push timer for support roam.
- Manage wave 4:15–4:45.
Support	Early vision → pivot to Grubs.	- Ward enemy raptor/pixel early.
- Recall for control wards before 4:30.
- Move mid-river pre-5:00.
🪲 5–14 MIN — VOID GRUBS & EARLY DRAGONS
Role	Focus	Checklist
Jungle	First major objective setup.	- Vision: sweep pit + choke.
- Decide fight or trade (Grubs ↔ Drake).
- Communicate Smite count and cooldown.
- Path for second spawn if stacked lead.
Top	Tempo link to Herald side.	- TP readiness.
- Wave fix before joining fight.
- Keep enemy top under tower to deny rotation.
Mid	River control.	- Maintain mid prio or at least wave parity.
- Escort jungle/support into river.
- Ping missing if enemy roams.
Bot (ADC)	Trade or rotate.	- If ahead, rotate to help Grubs after pushing.
- If behind, drop wave → hold tower safely.
- Farm for 1-item spike pre-Herald.
Support	Path & deny vision.	- Sweep pixel → tri → pit.
- Place deep ward behind pit (tracking rotations).
- Lead engage or peel.
🌀 14–17 MIN — RIFT HERALD PHASE
Role	Focus	Checklist
Jungle	Herald setup and timing.	- Recall for control wards @13:30.
- Establish top river vision by 14:30.
- Smite check → call for contest or cross-map.
Top	Wave & flank control.	- Slow push wave @14:00 for move.
- Track enemy TP.
- Look for flank angles if team fights.
Mid	Rotate window.	- Hard shove wave pre-15:00.
- Move first into top side.
- Protect jungle from invade.
Bot (ADC)	Lane crash → map rotation.	- Crash wave @14:20.
- Optional rotate mid for plates if Herald taken.
Support	Vision continuity.	- Drop wards along top-side river chain.
- Block enemy vision with sweeper.
- Communicate priority of lanes.
💠 17–20 MIN — BARON NASHOR PREP PHASE
Role	Focus	Checklist
Jungle	Vision denial & Smite timing.	- Sweep Baron side @18:00.
- Control pinks: ramp, river, pit.
- Sync recall for item spike.
Top	Wave management pre-fight.	- Fix bot wave if split-pushing.
- Hold TP for flank.
- Ping power spike timing.
Mid	Central map control.	- Clear wave → move to vision.
- Deny enemy river entrance.
ADC	Item check & fight readiness.	- Hit 2-item spike by 18:30.
- Recall sync with jungle.
- Position behind fog when setting up.
Support	Vision architecture.	- Build “triangle”: river entrance, ramp, pit bush.
- Use Oracle Lens from 18:00 onward.
- Coordinate engage lines with top/jungle.
🪓 20–25 MIN — BARON FIGHT / HANDOVER → BARON WINDOW
Role	Focus	Checklist
Jungle	Fight execution.	- Call engage if numbers advantage.
- Manage Smite + ability combo (~1800–2400 HP threshold).
- Secure Herald-like buff distribution.
Top	Split or join.	- Post-fight, fix side lanes for Baron setup.
- Keep TP advantage.
Mid	Transition.	- Hold mid prio → invade enemy top jungle.
- Maintain vision control mid → Baron.
ADC	Siege follow-up.	- Use Baron buff for wave control.
- Rotate lanes to maximize tower DPS.
Support	Vision link to Baron.	- After Nashor, re-ward around Baron ramp.
- Deny enemy vision chain.
- Set traps for facecheck fights.
👑 25+ MIN — BARON & LATE GAME MACRO
Role	Focus	Checklist
Jungle	Call objective logic.	- Turn or burn: track enemy jungle visibility.
- Keep Smite sync with ult CD.
- Communicate Nashor HP threshold.
Top	Side lane anchor.	- Keep opposite lane pushing.
- Be ready for TP collapse.
- If split champion, create 1v1 threat.
Mid	Fog control + wave management.	- Maintain mid prio 24/7.
- Always escort side pushers.
- Coordinate resets with support.
ADC	DPS & positioning discipline.	- Stay in visioned areas only.
- Focus on HP management for objective fights.
- If Nash secured: lead 1-4 siege pattern.
Support	Map control captain.	- Deep ward enemy jungle entrances.
- Deny pinks.
- Lead rotation from Nash → Elder.
🔥 30+ MIN — ELDER DRAGON / FINAL PUSH
Role	Focus	Checklist
Jungle	Win condition awareness.	- Elder = win → full commit call.
- Preload wards 1:00 before spawn.
- Secure sweep control around pit.
Top	Split → TP flank.	- Force side wave advantage.
- Communicate TP timers.
- Look for entry angle in fog.
Mid	Zone & cover.	- Maintain mid wave control.
- Flank denial duty.
ADC	Late-game patience.	- DPS only when vision secured.
- Position off fog.
- After win, push straight to end.
Support	Shotcall execution.	- Manage team reset timing.
- Track enemy flash & smite.
- Keep engage tools ready.
🧩 INTEGRATION TAGS (for strategic systems or datasets)
OBJECTIVE_PHASES = {
  "EARLY": [0,5],
  "GRUBS": [5,14],
  "HERALD": [14,17],
  "BARON_PREP": [17,20],
  "BARON_FIGHT": [20,25],
  "BARON_LATE": [25,30],
  "ELDER_FINAL": [30,99]
}

ROLE_ACTIONS = {
  "TOP": "wave_control, tp_flank, pressure_management",
  "JUNGLE": "vision_sync, smite_timing, path_control",
  "MID": "prio_rotation, vision_link, tempo_bridge",
  "ADC": "item_spike_check, dps_management, rotation_support",
  "SUPPORT": "vision_anchor, engage_setup, fog_control"
}
`;