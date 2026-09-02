import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CloudSun, i as Crosshair, n as LayoutList, o as Briefcase, r as Flag } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B67hvs0h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CLUBS = [
	{
		id: "dr",
		name: "Dr",
		fullName: "Driver",
		group: "woods",
		defaultOn: true
	},
	{
		id: "3w",
		name: "3W",
		fullName: "3 Wood",
		group: "woods",
		defaultOn: true
	},
	{
		id: "4w",
		name: "4W",
		fullName: "4 Wood",
		group: "woods",
		defaultOn: false
	},
	{
		id: "5w",
		name: "5W",
		fullName: "5 Wood",
		group: "woods",
		defaultOn: true
	},
	{
		id: "7w",
		name: "7W",
		fullName: "7 Wood",
		group: "woods",
		defaultOn: false
	},
	{
		id: "3h",
		name: "3H",
		fullName: "3 Hybrid",
		group: "hybrids",
		defaultOn: false
	},
	{
		id: "4h",
		name: "4H",
		fullName: "4 Hybrid",
		group: "hybrids",
		defaultOn: true
	},
	{
		id: "5h",
		name: "5H",
		fullName: "5 Hybrid",
		group: "hybrids",
		defaultOn: false
	},
	{
		id: "3i",
		name: "3i",
		fullName: "3 Iron",
		group: "irons",
		defaultOn: false
	},
	{
		id: "4i",
		name: "4i",
		fullName: "4 Iron",
		group: "irons",
		defaultOn: false
	},
	{
		id: "5i",
		name: "5i",
		fullName: "5 Iron",
		group: "irons",
		defaultOn: true
	},
	{
		id: "6i",
		name: "6i",
		fullName: "6 Iron",
		group: "irons",
		defaultOn: true
	},
	{
		id: "7i",
		name: "7i",
		fullName: "7 Iron",
		group: "irons",
		defaultOn: true
	},
	{
		id: "8i",
		name: "8i",
		fullName: "8 Iron",
		group: "irons",
		defaultOn: true
	},
	{
		id: "9i",
		name: "9i",
		fullName: "9 Iron",
		group: "irons",
		defaultOn: true
	},
	{
		id: "pw",
		name: "PW",
		fullName: "Pitching Wedge",
		group: "wedges",
		defaultOn: true
	},
	{
		id: "gw",
		name: "GW",
		fullName: "Gap Wedge",
		group: "wedges",
		defaultOn: true
	},
	{
		id: "sw",
		name: "SW",
		fullName: "Sand Wedge",
		group: "wedges",
		defaultOn: true
	},
	{
		id: "lw",
		name: "LW",
		fullName: "Lob Wedge",
		group: "wedges",
		defaultOn: false
	}
];
var CLUB_BY_ID = Object.fromEntries(CLUBS.map((c) => [c.id, c]));
var GROUPS = [
	{
		id: "woods",
		label: "Woods"
	},
	{
		id: "hybrids",
		label: "Hybrids"
	},
	{
		id: "irons",
		label: "Irons"
	},
	{
		id: "wedges",
		label: "Wedges"
	}
];
var DEFAULT_ENABLED = Object.fromEntries(CLUBS.map((c) => [c.id, c.defaultOn]));
var DRIVER_LOFTS = [
	8,
	8.5,
	9,
	9.5,
	10,
	10.5,
	11,
	11.5,
	12,
	12.5,
	13
];
var DEFAULT_LOFT = 10.5;
var SPEED_PRESETS = [
	{
		id: "senior",
		label: "Senior",
		mph: 80
	},
	{
		id: "light",
		label: "Light",
		mph: 88
	},
	{
		id: "average",
		label: "Average",
		mph: 95
	},
	{
		id: "pro",
		label: "Pro",
		mph: 114
	},
	{
		id: "custom",
		label: "Custom",
		mph: null
	}
];
var PRESET_MPH = {
	senior: 80,
	light: 88,
	average: 95,
	pro: 114
};
function clampMph(n) {
	return Math.min(130, Math.max(55, Math.round(n)));
}
var persistStorage = createJSONStorage(() => {
	if (typeof window === "undefined") return {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {}
	};
	return localStorage;
});
var useBagStore = create()(persist((set, get) => ({
	tab: "chart",
	speedPreset: "average",
	customMph: 95,
	effort: 100,
	enabledClubs: { ...DEFAULT_ENABLED },
	driverLoft: DEFAULT_LOFT,
	benchmarks: [],
	useConditions: false,
	weather: null,
	windDir: "ignore",
	windMph: 0,
	setTab: (tab) => set({ tab }),
	setPreset: (preset) => {
		if (preset === "custom") set({
			speedPreset: "custom",
			customMph: currentMph(get())
		});
		else set({ speedPreset: preset });
	},
	setCustomMph: (mph) => set({
		speedPreset: "custom",
		customMph: clampMph(mph)
	}),
	bumpCustomMph: (delta) => set({
		speedPreset: "custom",
		customMph: clampMph(currentMph(get()) + delta)
	}),
	setEffort: (effort) => set({ effort }),
	toggleClub: (id) => set({ enabledClubs: {
		...get().enabledClubs,
		[id]: !get().enabledClubs[id]
	} }),
	setDriverLoft: (loft) => set({ driverLoft: loft }),
	saveBenchmark: (b) => {
		set({ benchmarks: [{
			...b,
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			savedAt: Date.now(),
			driverMph: currentMph(get())
		}, ...get().benchmarks] });
	},
	clearBenchmarks: () => set({ benchmarks: [] }),
	setUseConditions: (on) => set({ useConditions: on }),
	setWeather: (w) => set({ weather: w }),
	setWindDir: (d) => set({ windDir: d }),
	setWindMph: (n) => set({ windMph: Math.min(30, Math.max(0, Math.round(n))) })
}), {
	name: "bag-chart-v1",
	storage: persistStorage,
	partialize: (s) => ({
		tab: s.tab,
		speedPreset: s.speedPreset,
		customMph: s.customMph,
		effort: s.effort,
		enabledClubs: s.enabledClubs,
		driverLoft: s.driverLoft,
		benchmarks: s.benchmarks,
		useConditions: s.useConditions,
		weather: s.weather,
		windDir: s.windDir,
		windMph: s.windMph
	})
}));
function currentMph(s) {
	if (s.speedPreset === "custom") return s.customMph;
	return PRESET_MPH[s.speedPreset];
}
function latestBenchmark(benchmarks, clubId) {
	return benchmarks.find((b) => b.clubId === clubId) ?? null;
}
function useHoldRepeat(action) {
	const actionRef = (0, import_react.useRef)(action);
	actionRef.current = action;
	const timers = (0, import_react.useRef)({ count: 0 });
	const fromPointer = (0, import_react.useRef)(false);
	const stop = (0, import_react.useCallback)(() => {
		if (timers.current.delay) window.clearTimeout(timers.current.delay);
		if (timers.current.interval) window.clearInterval(timers.current.interval);
		timers.current = { count: 0 };
	}, []);
	const startHold = (0, import_react.useCallback)(() => {
		timers.current.delay = window.setTimeout(() => {
			timers.current.interval = window.setInterval(() => {
				timers.current.count += 1;
				actionRef.current(timers.current.count > 16 ? 5 : 1);
			}, 55);
		}, 380);
	}, []);
	return {
		onPointerDown: (e) => {
			if (e.button !== 0) return;
			fromPointer.current = true;
			stop();
			actionRef.current(1);
			startHold();
		},
		onClick: () => {
			if (fromPointer.current) {
				fromPointer.current = false;
				return;
			}
			actionRef.current(1);
		},
		onPointerUp: () => {
			stop();
		},
		onPointerCancel: () => {
			stop();
			fromPointer.current = false;
		},
		onLostPointerCapture: () => {
			stop();
			fromPointer.current = false;
		},
		onPointerLeave: (e) => {
			if (e.pointerType === "mouse") stop();
		}
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Pill({ active, children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("inline-flex h-11 shrink-0 items-center justify-center rounded-pill px-3.5 text-sm font-medium", "transition-[background-color,color,transform,box-shadow] duration-150 ease-out-smooth", "active:scale-96", active ? "bg-gold text-gold-fg shadow-panel" : "bg-raised text-muted shadow-inset hover:text-ink", className),
		...props,
		children
	});
}
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xs font-medium tracking-widest text-muted uppercase",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-faint",
				children: hint
			}) : null
		]
	});
}
function TextInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-12 w-full rounded-md bg-raised px-3.5 text-base text-ink outline-none shadow-inset", "placeholder:text-faint", "focus:shadow-gold-focus", className),
		...props
	});
}
function PrimaryButton({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("inline-flex h-12 w-full items-center justify-center rounded-md bg-gold px-4 text-sm font-semibold text-gold-fg", "transition-[transform,filter] duration-150 ease-out-smooth", "active:scale-96 disabled:opacity-40 disabled:active:scale-100", className),
		...props,
		children
	});
}
function GhostButton({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("inline-flex h-12 items-center justify-center rounded-md px-4 text-sm font-medium text-muted shadow-inset", "transition-[color,transform] duration-150 ease-out-smooth", "hover:text-ink active:scale-96 disabled:opacity-40", className),
		...props,
		children
	});
}
function StepperButton({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("flex size-12 shrink-0 items-center justify-center rounded-md bg-raised text-xl font-medium text-gold shadow-inset select-none", "transition-transform duration-150 ease-out-smooth active:scale-96", "disabled:opacity-35 disabled:active:scale-100", className),
		...props,
		children
	});
}
function Switch({ checked, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		onClick: () => onChange(!checked),
		className: cn("relative h-7 w-12 rounded-pill transition-colors duration-200 ease-out-smooth", checked ? "bg-gold" : "bg-raised shadow-inset"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 left-0.5 size-6 rounded-pill bg-ink transition-transform duration-200 ease-out-smooth", checked ? "translate-x-5 bg-gold-fg" : "translate-x-0") })
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-surface p-4 shadow-panel", className),
		children
	});
}
var MPH_KEYS = [
	75,
	85,
	95,
	105,
	115
];
/** Carry yards at 75 / 85 / 95 / 105 / 115 driver mph. */
var CARRY_TABLE = {
	dr: [
		177,
		201,
		226,
		250,
		275
	],
	"3w": [
		152,
		173,
		194,
		215,
		236
	],
	"4w": [
		147,
		167,
		187,
		207,
		228
	],
	"5w": [
		142,
		161,
		181,
		200,
		220
	],
	"7w": [
		132,
		151,
		170,
		188,
		206
	],
	"3h": [
		140,
		160,
		180,
		198,
		216
	],
	"4h": [
		135,
		153,
		172,
		190,
		209
	],
	"5h": [
		128,
		146,
		164,
		181,
		198
	],
	"3i": [
		132,
		150,
		168,
		186,
		204
	],
	"4i": [
		127,
		145,
		160,
		178,
		195
	],
	"5i": [
		120,
		137,
		154,
		170,
		187
	],
	"6i": [
		113,
		129,
		145,
		160,
		176
	],
	"7i": [
		106,
		121,
		137,
		152,
		166
	],
	"8i": [
		98,
		112,
		126,
		140,
		154
	],
	"9i": [
		90,
		103,
		116,
		128,
		140
	],
	pw: [
		82,
		94,
		105,
		116,
		128
	],
	gw: [
		74,
		85,
		94,
		104,
		114
	],
	sw: [
		64,
		73,
		81,
		90,
		99
	],
	lw: [
		52,
		58,
		64,
		71,
		78
	]
};
/** Roll yards for non-driver clubs, bag order. */
var OTHER_ROLL = {
	"3w": 14,
	"4w": 13,
	"5w": 12,
	"7w": 10,
	"3h": 8,
	"4h": 7,
	"5h": 6,
	"3i": 6,
	"4i": 5,
	"5i": 5,
	"6i": 4,
	"7i": 3,
	"8i": 2,
	"9i": 2,
	pw: 1,
	gw: 1,
	sw: 0,
	lw: 0
};
var EFFORT_80 = .8 ** .88;
var REF_LOFT = 10.5;
function interpolateCarry(clubId, mph) {
	const values = CARRY_TABLE[clubId];
	const keys = MPH_KEYS;
	if (mph <= keys[0]) {
		const slope = (values[1] - values[0]) / (keys[1] - keys[0]);
		return values[0] + slope * (mph - keys[0]);
	}
	const last = keys.length - 1;
	if (mph >= keys[last]) {
		const slope = (values[last] - values[last - 1]) / (keys[last] - keys[last - 1]);
		return values[last] + slope * (mph - keys[last]);
	}
	for (let i = 0; i < last; i++) if (mph <= keys[i + 1]) {
		const t = (mph - keys[i]) / (keys[i + 1] - keys[i]);
		return values[i] + t * (values[i + 1] - values[i]);
	}
	return values[last];
}
function driverLoftAdj(loft, mph) {
	const dLoft = loft - REF_LOFT;
	return -2.2 * dLoft + 1.4 * dLoft * -((mph - 95) / 20);
}
function modelCarryRaw(clubId, mph, loft) {
	const base = interpolateCarry(clubId, mph);
	if (clubId !== "dr") return base;
	return base + driverLoftAdj(loft, mph);
}
function driverRoll(loft) {
	const dLoft = loft - REF_LOFT;
	return Math.max(8, 18 - dLoft * 1.6);
}
function clubRoll(clubId, loft) {
	if (clubId === "dr") return driverRoll(loft);
	return OTHER_ROLL[clubId];
}
function weatherMultiplier(c) {
	let wind = 0;
	if (c.windDir === "head") wind = -.01 * c.windMph;
	else if (c.windDir === "tail") wind = .005 * c.windMph;
	else if (c.windDir === "cross") wind = -.002 * c.windMph;
	const m = 1 + c.elevFt / 1e3 * .012 + (c.tempF - 70) * .0011 + wind;
	return Math.max(.75, m);
}
function computeYardage(opts) {
	const { clubId, mph, loft, effort, conditions, benchmark } = opts;
	const modelAtMph = modelCarryRaw(clubId, mph, loft);
	let yoursRaw = null;
	if (benchmark) {
		const modelAtSave = modelCarryRaw(clubId, benchmark.driverMph, loft);
		const scale = modelAtSave === 0 ? 1 : modelAtMph / modelAtSave;
		yoursRaw = benchmark.carry * scale;
	}
	const baseRaw = yoursRaw ?? modelAtMph;
	const effortScale = effort < 95 ? EFFORT_80 : 1;
	const wxScale = conditions ? weatherMultiplier(conditions) : 1;
	const carry = baseRaw * effortScale * wxScale;
	const modelCarry = modelAtMph * effortScale * wxScale;
	let roll = clubRoll(clubId, loft);
	roll *= effort >= 95 ? 1 : .7;
	if (conditions && conditions.elevFt > 3e3) roll *= .7;
	const vsModel = yoursRaw === null ? null : yoursRaw - modelAtMph;
	return {
		clubId,
		carry,
		total: carry + roll,
		modelCarry,
		modelCarryRaw: modelAtMph,
		yoursRaw,
		vsModel,
		isYours: yoursRaw !== null
	};
}
function fmt(n) {
	return String(Math.round(n));
}
function vsLabel(vs, isYours) {
	if (!isYours || vs === null) return "model";
	const r = Math.round(vs);
	if (r === 0) return "even vs model";
	return `${r > 0 ? "+" : ""}${r} vs model`;
}
function loftLabel(loft) {
	const t = loft.toFixed(1);
	return t.endsWith(".0") ? t.slice(0, -2) : t;
}
function ChartTab() {
	const enabledClubs = useBagStore((s) => s.enabledClubs);
	const driverLoft = useBagStore((s) => s.driverLoft);
	const effort = useBagStore((s) => s.effort);
	const benchmarks = useBagStore((s) => s.benchmarks);
	const useConditions = useBagStore((s) => s.useConditions);
	const weather = useBagStore((s) => s.weather);
	const windDir = useBagStore((s) => s.windDir);
	const windMph = useBagStore((s) => s.windMph);
	const mph = useBagStore(currentMph);
	const conditions = useConditions ? {
		elevFt: weather?.elevFt ?? 0,
		tempF: weather?.tempF ?? 70,
		windDir,
		windMph
	} : null;
	const chart = CLUBS.filter((c) => enabledClubs[c.id]).map((club) => {
		const bench = latestBenchmark(benchmarks, club.id);
		return computeYardage({
			clubId: club.id,
			mph,
			loft: driverLoft,
			effort,
			conditions,
			benchmark: bench ? {
				clubId: club.id,
				carry: bench.carry,
				driverMph: bench.driverMph
			} : null
		});
	});
	const flightPct = conditions ? Math.round(weatherMultiplier(conditions) * 100) : 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			useConditions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-lg bg-surface px-3.5 py-2.5 text-xs text-muted shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: weather?.place ?? "No location yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium text-gold tabular-nums",
					children: [flightPct, "% flight"]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl bg-surface shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-end gap-2 border-b border-line px-4 pt-3 pb-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xs font-medium tracking-widest text-faint uppercase",
							children: "Club"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xs text-right font-medium tracking-widest text-faint uppercase",
							children: "Carry"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xs text-right font-medium tracking-widest text-faint uppercase",
							children: "Total"
						})
					]
				}), chart.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-10 text-center text-sm text-muted",
					children: "Turn on clubs in Bag to build your chart."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: chart.map((row, i) => {
					const club = CLUB_BY_ID[row.clubId];
					const label = row.clubId === "dr" ? `Dr ${loftLabel(driverLoft)}°` : club.name;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 px-4 py-3", i < chart.length - 1 && "border-b border-line"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold tracking-tight text-ink",
										children: label
									}), row.isYours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-pill bg-gold/15 px-1.5 py-0.5 text-2xs font-semibold tracking-wide text-gold uppercase",
										children: "Yours"
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-xs text-faint",
									children: vsLabel(row.vsModel, row.isYours)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-stat text-right font-sans text-gold tabular-nums",
								children: fmt(row.carry)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-stat text-right font-sans text-ink tabular-nums",
								children: fmt(row.total)
							})
						]
					}, row.clubId);
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-1 text-center text-xs text-faint",
				children: [
					effort === 80 ? "80% effort · " : "",
					"Distances in yards",
					useConditions ? " · conditions on" : ""
				]
			})
		]
	});
}
function BagTab() {
	const enabled = useBagStore((s) => s.enabledClubs);
	const toggle = useBagStore((s) => s.toggleClub);
	const loft = useBagStore((s) => s.driverLoft);
	const setLoft = useBagStore((s) => s.setDriverLoft);
	const count = CLUBS.filter((c) => enabled[c.id]).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-end justify-between px-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Your bag"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [count, " clubs in play"]
			})] })
		}), GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "overflow-hidden rounded-xl bg-surface shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "border-b border-line px-4 py-2.5 text-2xs font-medium tracking-widest text-faint uppercase",
				children: g.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: CLUBS.filter((c) => c.group === g.id).map((club, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn(i < arr.length - 1 && "border-b border-line"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-14 items-center justify-between gap-3 px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium text-ink",
						children: club.fullName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-faint",
						children: club.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: enabled[club.id],
						onChange: () => toggle(club.id),
						label: `${enabled[club.id] ? "Remove" : "Add"} ${club.fullName}`
					})]
				}), club.id === "dr" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pt-1 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xs font-medium tracking-widest text-muted uppercase",
							children: "Loft"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-gold tabular-nums",
							children: [loft, "°"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1",
						children: DRIVER_LOFTS.map((deg) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setLoft(deg),
								className: cn("h-11 min-w-12 shrink-0 rounded-pill px-2.5 text-sm tabular-nums", "transition-[background-color,color,transform] duration-150 ease-out-smooth", "active:scale-96", loft === deg ? "bg-gold font-semibold text-gold-fg" : "bg-raised text-muted shadow-inset"),
								children: [deg, "°"]
							}, deg);
						})
					})]
				}) : null]
			}, club.id)) })]
		}, g.id))]
	});
}
var SOURCES = [
	{
		id: "sim",
		label: "Sim"
	},
	{
		id: "course",
		label: "Course"
	},
	{
		id: "range",
		label: "Range"
	}
];
function timeLabel(ts) {
	return new Date(ts).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function BenchmarkTab() {
	const enabled = useBagStore((s) => s.enabledClubs);
	const mph = useBagStore(currentMph);
	const save = useBagStore((s) => s.saveBenchmark);
	const clear = useBagStore((s) => s.clearBenchmarks);
	const list = useBagStore((s) => s.benchmarks);
	const inBag = (0, import_react.useMemo)(() => CLUBS.filter((c) => enabled[c.id]), [enabled]);
	const [clubId, setClubId] = (0, import_react.useState)(inBag[0]?.id ?? "dr");
	const [carry, setCarry] = (0, import_react.useState)("");
	const [clubSpeed, setClubSpeed] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)("sim");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [savedFlash, setSavedFlash] = (0, import_react.useState)(false);
	const activeClub = inBag.some((c) => c.id === clubId) ? clubId : inBag[0]?.id ?? "dr";
	const carryN = Number(carry);
	const speedN = clubSpeed.trim() === "" ? void 0 : Number(clubSpeed);
	const canSave = inBag.length > 0 && Number.isFinite(carryN) && carryN >= 1 && carryN <= 450 && (speedN === void 0 || Number.isFinite(speedN) && speedN >= 30 && speedN <= 160);
	function onSave() {
		if (!canSave) return;
		save({
			clubId: activeClub,
			carry: Math.round(carryN),
			clubSpeed: speedN === void 0 ? void 0 : Math.round(speedN),
			source,
			notes: notes.trim()
		});
		setCarry("");
		setClubSpeed("");
		setNotes("");
		setSavedFlash(true);
		window.setTimeout(() => setSavedFlash(false), 1400);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Benchmark"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Replace a club’s model number with a carry you actually hit. Still scales with 80% and weather."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-surface p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Club",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1",
							children: inBag.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted",
								children: "Turn on clubs in Bag first."
							}) : inBag.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								active: activeClub === c.id,
								onClick: () => setClubId(c.id),
								children: c.id === "dr" ? "Dr" : c.name
							}, c.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Carry (yd)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								inputMode: "decimal",
								type: "number",
								min: 1,
								max: 450,
								placeholder: "e.g. 242",
								value: carry,
								onChange: (e) => setCarry(e.target.value)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Club speed",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								inputMode: "decimal",
								type: "number",
								min: 30,
								max: 160,
								placeholder: "mph",
								value: clubSpeed,
								onChange: (e) => setClubSpeed(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Source",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1.5",
								children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									active: source === s.id,
									onClick: () => setSource(s.id),
									className: "flex-1",
									children: s.label
								}, s.id))
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								placeholder: "Trackman, 70°F, slight into…",
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								maxLength: 120
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
						className: "mt-5",
						disabled: !canSave,
						onClick: onSave,
						children: savedFlash ? "Saved to chart" : `Save at ${mph} mph`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-2xs font-medium tracking-widest text-faint uppercase",
					children: "Recent"
				}), list.length > 0 ? confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
						className: "h-9 px-3 text-xs",
						onClick: () => setConfirmClear(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
						className: "h-9 px-3 text-xs text-danger",
						onClick: () => {
							clear();
							setConfirmClear(false);
						},
						children: "Confirm clear"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
					className: "h-9 px-3 text-xs",
					onClick: () => setConfirmClear(true),
					children: "Clear all"
				}) : null]
			}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-panel",
				children: "No benchmarks yet. Save a carry to pin YOURS on the chart."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-xl bg-surface shadow-panel",
				children: list.map((b, i) => {
					const club = CLUB_BY_ID[b.clubId];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-start justify-between gap-3 px-4 py-3", i < list.length - 1 && "border-b border-line"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: club.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xs tracking-wide text-gold uppercase",
										children: b.source
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										b.carry,
										" yd",
										b.clubSpeed ? ` · ${b.clubSpeed} mph` : "",
										` · ${b.driverMph} driver`
									]
								}),
								b.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 truncate text-xs text-faint",
									children: b.notes
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-faint tabular-nums",
							children: timeLabel(b.savedAt)
						})]
					}, b.id);
				})
			})] })
		]
	});
}
async function searchPlaces(query) {
	const q = query.trim();
	if (q.length < 2) return [];
	const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
	url.searchParams.set("name", q);
	url.searchParams.set("count", "6");
	url.searchParams.set("language", "en");
	url.searchParams.set("format", "json");
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error("Place search failed");
	return ((await res.json()).results ?? []).map((r) => {
		const bits = [r.admin1, r.country].filter(Boolean);
		return {
			name: r.name,
			detail: bits.join(", "),
			lat: r.latitude,
			lon: r.longitude
		};
	});
}
async function fetchForecast(lat, lon) {
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", String(lat));
	url.searchParams.set("longitude", String(lon));
	url.searchParams.set("current", "temperature_2m");
	url.searchParams.set("temperature_unit", "fahrenheit");
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error("Forecast failed");
	const data = await res.json();
	const tempF = data.current?.temperature_2m;
	if (typeof tempF !== "number") throw new Error("No temperature");
	return {
		tempF,
		elevFt: (typeof data.elevation === "number" ? data.elevation : 0) * 3.28084,
		lat,
		lon
	};
}
async function reversePlace(lat, lon) {
	try {
		const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
		url.searchParams.set("latitude", String(lat));
		url.searchParams.set("longitude", String(lon));
		url.searchParams.set("localityLanguage", "en");
		const res = await fetch(url.toString());
		if (!res.ok) return "My location";
		const data = await res.json();
		const city = data.city || data.locality;
		const region = data.principalSubdivisionCode?.replace(/^[A-Z]{2}-/, "") || data.principalSubdivision;
		if (city && region && city !== region) return `${city}, ${region}`;
		return city || region || "My location";
	} catch {
		return "My location";
	}
}
var WIND = [
	{
		id: "ignore",
		label: "Ignore"
	},
	{
		id: "head",
		label: "Head"
	},
	{
		id: "tail",
		label: "Tail"
	},
	{
		id: "cross",
		label: "Cross"
	}
];
function RoundTab() {
	const useOn = useBagStore((s) => s.useConditions);
	const setUse = useBagStore((s) => s.setUseConditions);
	const weather = useBagStore((s) => s.weather);
	const setWeather = useBagStore((s) => s.setWeather);
	const windDir = useBagStore((s) => s.windDir);
	const setWindDir = useBagStore((s) => s.setWindDir);
	const windMph = useBagStore((s) => s.windMph);
	const setWindMph = useBagStore((s) => s.setWindMph);
	const [query, setQuery] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [loadingWx, setLoadingWx] = (0, import_react.useState)(false);
	const [geoBusy, setGeoBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const seq = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 2) {
			setHits([]);
			return;
		}
		const id = window.setTimeout(async () => {
			const n = ++seq.current;
			setSearching(true);
			try {
				const results = await searchPlaces(q);
				if (seq.current === n) setHits(results);
			} catch {
				if (seq.current === n) setError("Search failed — check connection.");
			} finally {
				if (seq.current === n) setSearching(false);
			}
		}, 280);
		return () => window.clearTimeout(id);
	}, [query]);
	async function applyPlace(place, lat, lon) {
		setLoadingWx(true);
		setError(null);
		try {
			const f = await fetchForecast(lat, lon);
			setWeather({
				place,
				lat: f.lat,
				lon: f.lon,
				elevFt: f.elevFt,
				tempF: f.tempF,
				fetchedAt: Date.now()
			});
			setHits([]);
			setQuery("");
			if (!useOn) setUse(true);
		} catch {
			setError("Weather unavailable. Distances stay on standard air until this works.");
		} finally {
			setLoadingWx(false);
		}
	}
	function useMyLocation() {
		if (!navigator.geolocation) {
			setError("Location isn’t available in this browser.");
			return;
		}
		setGeoBusy(true);
		setError(null);
		navigator.geolocation.getCurrentPosition(async (pos) => {
			const { latitude, longitude } = pos.coords;
			try {
				await applyPlace(await reversePlace(latitude, longitude), latitude, longitude);
			} finally {
				setGeoBusy(false);
			}
		}, () => {
			setGeoBusy(false);
			setError("Couldn’t read location. Search a city or course instead.");
		}, {
			enableHighAccuracy: false,
			timeout: 12e3,
			maximumAge: 6e4
		});
	}
	const elev = weather?.elevFt ?? 0;
	const temp = weather?.tempF ?? 70;
	const mult = weatherMultiplier({
		elevFt: useOn ? elev : 0,
		tempF: useOn ? temp : 70,
		windDir: useOn ? windDir : "ignore",
		windMph: useOn ? windMph : 0
	});
	const flightPct = Math.round(mult * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "This round"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Fold elevation, temperature, and wind into the chart. Works offline until you fetch weather."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: "Use conditions this round"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted",
					children: "Scales carry on Chart and Benchmarks"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: useOn,
					onChange: setUse,
					label: "Use conditions this round"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Location",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: query,
						onChange: (e) => {
							setQuery(e.target.value);
							setError(null);
						},
						placeholder: "City or course",
						autoComplete: "off"
					})
				}),
				searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-faint",
					children: "Searching…"
				}) : null,
				hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 overflow-hidden rounded-md bg-raised",
					children: hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border-b border-line last:border-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex min-h-12 w-full flex-col items-start px-3 py-2 text-left",
							onClick: () => applyPlace(h.detail ? `${h.name}, ${h.detail}` : h.name, h.lat, h.lon),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: h.name
							}), h.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: h.detail
							}) : null]
						})
					}, `${h.lat},${h.lon}`))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
						onClick: useMyLocation,
						disabled: geoBusy || loadingWx,
						children: geoBusy ? "Locating…" : "Use my location"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
						className: "w-full",
						disabled: !weather || loadingWx,
						onClick: () => weather && applyPlace(weather.place, weather.lat, weather.lon),
						children: loadingWx ? "Updating…" : "Refresh"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Wind",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1.5",
					children: WIND.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						active: windDir === w.id,
						onClick: () => setWindDir(w.id),
						className: "px-2",
						children: w.label
					}, w.id))
				})
			}), windDir !== "ignore" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs font-medium tracking-widest text-muted uppercase",
						children: "Speed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-gold tabular-nums",
						children: [windMph, " mph"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 30,
					step: 1,
					value: windMph,
					onChange: (e) => setWindMph(Number(e.target.value)),
					className: "w-full",
					"aria-label": "Wind speed"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-faint",
				children: "Wind left out of the multiplier."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-2xs font-medium tracking-widest text-faint uppercase",
					children: "Ball flight"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Place",
							value: weather?.place ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Elev",
							value: weather ? `${Math.round(weather.elevFt)} ft` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Temp",
							value: weather ? `${Math.round(weather.tempF)}°F` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Ball-flight",
							value: `${flightPct}%`,
							gold: true
						})
					]
				}),
				useOn && weather && weather.elevFt > 3e3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-gold",
					children: "Above 3,000 ft — roll reduced."
				}) : null
			] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 text-sm text-danger",
				children: error
			}) : null
		]
	});
}
function Stat({ label, value, gold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-2xs tracking-widest text-faint uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: cn("mt-0.5 truncate text-base font-medium tabular-nums", gold ? "text-gold" : "text-ink"),
		children: value
	})] });
}
var TABS = [
	{
		id: "chart",
		label: "Chart",
		icon: LayoutList
	},
	{
		id: "bag",
		label: "Bag",
		icon: Briefcase
	},
	{
		id: "benchmark",
		label: "Benchmark",
		icon: Crosshair
	},
	{
		id: "round",
		label: "Round",
		icon: CloudSun
	}
];
function AppShell() {
	const tab = useBagStore((s) => s.tab);
	const setTab = useBagStore((s) => s.setTab);
	const effort = useBagStore((s) => s.effort);
	const setEffort = useBagStore((s) => s.setEffort);
	const preset = useBagStore((s) => s.speedPreset);
	const setPreset = useBagStore((s) => s.setPreset);
	const mph = useBagStore(currentMph);
	const bump = useBagStore((s) => s.bumpCustomMph);
	const clubCount = useBagStore((s) => CLUBS.filter((c) => s.enabledClubs[c.id]).length);
	const minus = useHoldRepeat((step) => bump(-step));
	const plus = useHoldRepeat((step) => bump(step));
	(0, import_react.useEffect)(() => {
		window.scrollTo({ top: 0 });
	}, [tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh w-full bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-dvh w-full min-w-0 max-w-md flex-col bg-bg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 border-b border-line bg-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 items-center justify-center rounded-md bg-surface text-gold shadow-panel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
										className: "size-4",
										strokeWidth: 2.2
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-xl leading-tight font-medium tracking-tight text-ink italic",
									children: "Bag Chart"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-2xs tracking-wide text-muted tabular-nums",
									children: [
										mph,
										" mph · ",
										clubCount,
										" clubs"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-11 rounded-pill bg-raised p-1 shadow-inset",
								role: "group",
								"aria-label": "Swing effort",
								children: [100, 80].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setEffort(n),
									className: cn("h-9 min-w-14 rounded-pill px-2.5 text-xs font-semibold tabular-nums", "transition-[background-color,color] duration-150 ease-out-smooth", effort === n ? "bg-gold text-gold-fg" : "text-muted"),
									children: [n, "%"]
								}, n))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: SPEED_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
								active: preset === p.id,
								onClick: () => setPreset(p.id),
								children: [p.label, p.mph ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 text-2xs tabular-nums opacity-80",
									children: p.mph
								}) : null]
							}, p.id))
						}),
						preset === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepperButton, {
									"aria-label": "Slower",
									disabled: mph <= 55,
									...minus,
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-24 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-3xl leading-none font-medium text-gold tabular-nums",
										children: mph
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-2xs tracking-widest text-faint uppercase",
										children: "mph"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepperButton, {
									"aria-label": "Faster",
									disabled: mph >= 130,
									...plus,
									children: "+"
								})
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "flex-1 px-4 pt-4 pb-24",
					children: [
						tab === "chart" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTab, {}) : null,
						tab === "bag" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BagTab, {}) : null,
						tab === "benchmark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BenchmarkTab, {}) : null,
						tab === "round" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundTab, {}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "sticky bottom-0 z-20 mt-auto border-t border-line bg-surface/95 px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md",
					"aria-label": "Primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-4",
						children: TABS.map((t) => {
							const Icon = t.icon;
							const on = tab === t.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setTab(t.id),
								className: cn("flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md", "transition-colors duration-150 ease-out-smooth", on ? "text-gold" : "text-faint"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: on ? 2.3 : 1.8
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xs font-medium tracking-wide",
									children: t.label
								})]
							}) }, t.id);
						})
					})
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
