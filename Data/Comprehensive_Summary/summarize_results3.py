#!/usr/bin/env python3
"""
Group 1 - summarize_results3.py
Enter EVERY simulation, collect ITS OWN output files and values, experiment by experiment.

    py summarize_results3.py                 (Windows, in the folder that has run_all.py)
    py summarize_results3.py --only E0,E5    (only some experiments)
    py summarize_results3.py --daily         (also the daily files of E0-E7, very large)

How it works
  It walks EVERY folder under ./experiments (or --root). Any folder holding .dlf and/or .dai files
  is entered, whatever the number of .dlf files (0, 9, 14 or more). The .dlf files are grouped by
  the simulation named in their own header (SIMFILE), so each simulation is treated independently,
  even if several simulations wrote into the same folder. A simulation with a .dai but no .dlf is
  listed as "no output files".
  Every simulation folder has its own .dai and its own output files. The file NAMES repeat
  (Annual-FN.dlf, Annual-Harvest.dlf ...) but each file has its own header (SIMFILE, SIM,
  RUN, VERSION, LOGFILE, INTERVAL) and its own values, and some simulations have more output
  files than others. For each experiment, one after the other (E0 baselines first), the script:
    1. enters each simulation folder and opens each of its .dlf files;
    2. keeps EVERY value: every date (row) of every file, every column, with units;
       files of the same simulation are put side by side on the same date
       (e.g. 1981-04-01: Annual-FN, Annual-FN_100cm, Annual-FWater, Annual-SWater ...;
        harvest dates: Annual-Harvest), and each row carries the simulation's own
       SIMFILE, SIM, RUN time and VERSION read from its files;
    3. writes the experiment CSV (all its simulations, one after the other);
    4. writes the experiment SUMMARY (one row per simulation: settings from its .dai, each
       file's header, long-term means and the indexes IE, IWUE, DPF, PFPn, NLF, checks);
    5. goes to the next experiment. At the end: the summary of all 17 experiments.

Output: Comprehensive_Summary/
    E00_Baselines.csv ... E16_Edge_Cases.csv          17 CSVs: all values of all simulations
    Experiment_Summaries/E00_Baselines_SUMMARY.csv    17 CSVs: one row per simulation
    00_SUMMARY_ALL_EXPERIMENTS.csv                    one row per experiment + TOTAL
    00_summary_all_simulations.csv                    the 10,190 summary rows together
    Daily/E00_Baselines_daily.csv ...                 only with --daily

Column names: "<file> | <variable> [unit]", e.g. "Annual-FN | Matrix-Leaching [kg N/ha]".

Indexes (course definitions, long-term TOTALS; harvest year Y matched with the next balance date):
    IE    = sum(yield kg/ha) / sum(irrigation mm * 10)                   [kg/m3]
    IWUE  = (sum yield - sum rainfed yield same soil/years) / (irr*10)   [kg/m3]
    DPF   = sum(drainage below 1 m) / sum(rain + irrigation)             [-]
    PFPn  = sum(yield kg DM/ha) / sum(N fertiliser kg N/ha)              [kg/kg]
    NLF   = sum(N leached below 1 m) / sum(N fertiliser)                 [-]
Status checks: SOLVER_FAILURE (h > +1e4 cm), OUTPUT_FROM_OTHER_SIM (SIMFILE in the file header is
not this folder's .dai), NO RESULTS, not run; identical_output_to = same results as another
simulation of the experiment. Use status = ok for analysis.
"""
import argparse, csv, glob, hashlib, math, os, re, sys, time
from collections import OrderedDict, defaultdict
from concurrent.futures import ProcessPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
EXP = os.path.join(HERE, "experiments")
EXPECTED = OrderedDict([("E0", 10), ("E1", 200), ("E2", 200), ("E3", 200), ("E4", 100), ("E5", 300),
                        ("E6", 210), ("E7", 200), ("E8", 1000), ("E9", 1000), ("E10", 1000), ("E11", 1000),
                        ("E12", 1000), ("E13", 1000), ("E14", 1000), ("E15", 1000), ("E16", 770)])
ENC = "utf-8-sig"          # opens cleanly in Excel
DATE_COLS = {"year", "month", "mday", "day", "hour"}


# ----------------------------------------------------------------------------- reading
def exp_order(name):
    m = re.match(r"E(\d+)", name)
    return (int(m.group(1)) if m else 999, name)

def exp_label(name):
    m = re.match(r"E(\d+)_?(.*)", name)
    return f"E{int(m.group(1)):02d}_{m.group(2)}" if m else name

def num(x):
    try:
        v = float(x)
        return v if math.isfinite(v) else 0.0
    except (TypeError, ValueError):
        return 0.0

def fnum(x):
    try:
        v = float(x)
        return v if math.isfinite(v) else None
    except (TypeError, ValueError):
        return None

def parse_dlf(path, header_only=False):
    """Return dict(title, meta, cols, units, rows). Works with any Daisy .dlf file."""
    with open(path, encoding="latin-1") as fh:
        first = fh.readline().rstrip("\r\n")
        title = first.split("--", 1)[1].strip() if "--" in first else first
        meta, logtxt = OrderedDict(), []
        line = fh.readline()
        while line:
            s = line.rstrip("\r\n")
            if s.startswith("-----"):
                break
            if s.startswith(("year\t", "year ")):      # file without separator line
                break
            m = re.match(r"([A-Z_]+):\s?(.*)$", s)
            if m:
                k, v = m.group(1), m.group(2).strip()
                if k == "LOG":
                    logtxt.append(v)
                elif k in meta:
                    meta[k] += " ; " + v
                else:
                    meta[k] = v
            line = fh.readline()
        head = line.rstrip("\r\n") if line.startswith(("year\t", "year ")) else fh.readline().rstrip("\r\n")
        cols = head.split("\t")
        units = fh.readline().rstrip("\r\n").split("\t")
        units += [""] * (len(cols) - len(units))
        seen = defaultdict(int)                          # make column names unique
        for i, c in enumerate(cols):
            seen[c] += 1
            if seen[c] > 1:
                cols[i] = f"{c} ({seen[c]})"
        if logtxt:
            meta["LOG"] = " ".join(t for t in logtxt if t).strip()
        out = dict(title=title, meta=meta, cols=cols, units=units[:len(cols)], rows=[])
        if header_only:
            return out
        for l in fh:
            l = l.rstrip("\r\n")
            if not l.strip():
                continue
            p = l.split("\t")
            if len(p) < len(cols):
                p += [""] * (len(cols) - len(p))
            out["rows"].append(p[:len(cols)])
    return out

def labelled(cols, units):
    return [f"{c} [{u}]" if u.strip() else c for c, u in zip(cols, units)]

def log_type(path, rid, meta):
    lf = meta.get("LOGFILE", "")
    if lf:
        name = re.split(r"[\\/]", lf)[-1]
    else:
        name = os.path.basename(path)
        if name.startswith(rid + "-"):
            name = name[len(rid) + 1:]
        m = re.search(r"((Annual|Daily|Hourly|Monthly|Season|Soil)-.*)$", name)
        name = m.group(1) if m else name
    return re.sub(r"\.dlf$", "", name, flags=re.I)

SKIP_DIRS = {"comprehensive_summary", "common", "results", ".git", "__pycache__", ".vscode", "daily"}
SPLIT_RX = re.compile(r"^(.*?)-(?:Annual|Daily|Hourly|Monthly|Season|Soil|Field|Crop)[-_]", re.I)

def quick_simfile(path):
    """SIMFILE named in the header of a .dlf (first lines only)."""
    try:
        with open(path, encoding="latin-1") as fh:
            for i, l in enumerate(fh):
                if l.startswith("SIMFILE:"):
                    return re.split(r"[\\/]", l.split(":", 1)[1].strip())[-1]
                if l.startswith("-----") or i > 80:
                    break
    except OSError:
        pass
    return ""

def discover(root, only=None):
    """Walk EVERY folder under root. Every folder with .dlf and/or .dai files is entered; its .dlf
    files are grouped by the simulation named in their own header (SIMFILE), so even a folder holding
    the outputs of several simulations is split correctly. Returns a list of simulations."""
    sims, exp_names = [], {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d.lower() not in SKIP_DIRS)
        dlfs = sorted(os.path.join(dirpath, f) for f in filenames if f.lower().endswith(".dlf"))
        dais = sorted(f for f in filenames if f.lower().endswith(".dai"))
        if not dlfs and not dais:
            continue
        rel = os.path.relpath(dirpath, root).split(os.sep)
        exp = next((x for x in rel if re.match(r"E\d+(_|$)", x)), "")
        folder_name = os.path.basename(dirpath)
        groups = OrderedDict()
        for p in dlfs:
            sf = quick_simfile(p)
            key = os.path.splitext(sf)[0] if sf else ""
            if not key:
                m = SPLIT_RX.match(os.path.basename(p))
                key = m.group(1) if m else folder_name
            groups.setdefault(key, []).append(p)
        if len(groups) == 1:                      # normal case: one simulation per folder
            groups = OrderedDict([(folder_name if (folder_name + ".dai") in dais or not dais else
                                   next(iter(groups)), next(iter(groups.values())))])
        if not groups:                            # .dai but no output yet
            stem = folder_name if (folder_name + ".dai") in dais else os.path.splitext(dais[0])[0]
            groups[stem] = []
        for rid, files in groups.items():
            e = exp
            if not e:
                m = re.match(r"(E\d+)_", rid)
                e = m.group(1) if m else "Unsorted"
            sims.append(dict(exp=e, rid=rid, folder=dirpath, files=files, shared=len(groups) > 1))
            pre = e.split("_")[0]
            if "_" in e:
                exp_names[pre] = e
    for sm in sims:                               # "E5" -> "E5_SHP_Dynamics" when the long name is known
        if "_" not in sm["exp"] and sm["exp"] in exp_names:
            sm["exp"] = exp_names[sm["exp"]]
    if only:
        pre = tuple(x.strip() + "_" for x in only.split(","))
        sims = [sm for sm in sims if (sm["exp"] + "_").startswith(pre)]
    sims.sort(key=lambda sm: (exp_order(sm["exp"]), sm["rid"]))
    return sims

def treatment(rid):
    m = re.match(r"E\d+_(S\d\d_[A-Za-z]+)_(.*)$", rid)
    return (m.group(1), m.group(2)) if m else ("", rid)

def dlf_files(folder):
    return sorted(glob.glob(os.path.join(folder, "*.dlf")))


# ----------------------------------------------------------------------------- .dai settings
def dai_settings(folder, rid):
    path = os.path.join(folder, rid + ".dai")
    if not os.path.exists(path):
        hits = glob.glob(os.path.join(folder, "*.dai"))
        path = hits[0] if hits else None
    s = OrderedDict()
    if not path:
        return s
    t = open(path, encoding="latin-1").read()
    code = "\n".join(l for l in t.split("\n") if not l.strip().startswith(";;"))
    def f(rx, txt=code, g=1):
        m = re.search(rx, txt, re.S)
        return m.group(g) if m else ""
    s["description"] = f(r'\(description\s+"([^"]*)"')
    s["soil_file"] = os.path.basename(f(r'"([^"]*soils/[^"]+\.dai)"'))
    crop = os.path.basename(f(r'"([^"]*crops/[^"]+\.dai)"'))
    s["crop_file"] = crop
    s["N_rate_kg_ha"] = f(r"_N(\d+)", crop)
    s["tillage"] = "reduced" if "reduced" in crop else "no-till" if "notill" in crop else "conventional" if crop else ""
    s["output_log"] = os.path.basename(f(r'"([^"]*OutputLog_[^"]+\.dai)"'))
    s["weather_files"] = "; ".join(sorted({os.path.basename(w) for w in re.findall(r'"([^"]+\.dwf)"', code)}))
    s["PrecipCorrect"] = f(r"\(PrecipCorrect\s+([-\d.]+)")
    s["PrecipScale"] = f(r"\(PrecipScale\s+([-\d.]+)")
    s["TempOffset_C"] = f(r"\(TempOffset\s+([-+\d.]+)")
    m = re.search(r"\((irrigate_overhead|irrigate_surface|irrigate_subsoil)\s+([-\d.]+)\s*\[mm/h\]\s*\(hours\s+([-\d.]+)\)", code)
    s["irrigation_method"] = m.group(1).replace("irrigate_", "") if m else "none"
    s["irrigation_rate_mm_h"] = m.group(2) if m else ""
    s["irrigation_hours"] = m.group(3) if m else ""
    s["dose_mm_per_event"] = round(float(m.group(2)) * float(m.group(3)), 3) if m else ""
    s["drip_top_cm"] = f(r"\(top\s+finite\s+([-\d.]+)")
    s["drip_bottom_cm"] = f(r"\(bottom\s+finite\s+([-\d.]+)")
    s["sensor_depth_cm"] = f(r"soil_water_pressure_above\s*\(height\s+([-\d.]+)")
    s["trigger_potential_cm"] = f(r"\(potential\s+([-\d.]+)\s*\[cm\]")
    m = re.search(r"after_mm_dd\s+(\d+)\s+(\d+)\)\s*\(before_mm_dd\s+(\d+)\s+(\d+)", code)
    s["irrigation_window"] = f"{m.group(1)}/{m.group(2)}-{m.group(3)}/{m.group(4)}" if m else ""
    s["mulch_vapor_flux_factor"] = f(r"vapor_flux_factor\s+([-\d.]+)")
    s["mulch_interception_mm"] = f(r"interception_capacity\s+([-\d.]+)")
    s["EpFactor"] = f(r"EpFactor\s+([-\d.]+)")
    s["MaxRootingDepth_cm"] = f(r"MaxRootingDepth\s+([-\d.]+)")
    s["initial_h"] = " ".join(f(r"initial_h\s*\((.*?)\)\)").split())
    s["start"] = "-".join(f(r"\(time\s+(\d+\s+\d+\s+\d+)\)").split())
    s["stop"] = "-".join(f(r"\(stop\s+(\d+\s+\d+\s+\d+)\)").split())
    return s




def safe(name):
    return re.sub(r"[^A-Za-z0-9_.+-]+", "_", name)

def write_dicts(path, rows, cols=None):
    if cols is None:
        cols = []
        for r in rows:
            for k in r:
                if k not in cols:
                    cols.append(k)
    with open(path, "w", newline="", encoding=ENC) as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore"); w.writeheader(); w.writerows(rows)


# ----------------------------------------------------------------------------- indexes
INDEX_NAMES = [("Y", "yield_Mg_ha"), ("WS", "water_stress_d"), ("NS", "N_stress_d"), ("P", "rain_mm"),
               ("I", "irrigation_mm"), ("D", "drainage_1m_mm"), ("ET", "ET_mm"), ("Ecan", "canopy_evap_mm"),
               ("Esoil", "soil_evap_mm"), ("Tr", "transpiration_mm"), ("NL", "N_leached_kg_ha"),
               ("Nf", "N_fertiliser_kg_ha"), ("NU", "N_uptake_kg_ha")]

def as_dicts(d):
    return [dict(zip(d["cols"], r)) for r in d["rows"]] if d else None

def indexes(parsed):
    """Match each harvest with the next annual balance; long-term means and indexes."""
    harv = as_dicts(parsed.get("Annual-Harvest"))
    fw, fn = as_dicts(parsed.get("Annual-FWater_100cm")), as_dicts(parsed.get("Annual-FN_100cm"))
    sw = as_dicts(parsed.get("Annual-SWater"))
    if not harv or not fw:
        return None, {}
    def dated(rows):
        o = []
        for r in rows or []:
            try:
                o.append(((int(num(r["year"])), int(num(r.get("month", 0))),
                           int(num(r.get("mday", r.get("day", 0))))), r))
            except (KeyError, ValueError):
                pass
        return sorted(o, key=lambda x: x[0])
    fwD, fnD, swD = dated(fw), dated(fn), dated(sw)
    def after(rowsD, d):
        for dd, r in rowsD:
            if dd > d:
                return dd, r
        return None, {}
    years, used = OrderedDict(), set()
    for r in harv:
        Y = int(num(r["year"])); d = (Y, int(num(r.get("month", 0))), int(num(r.get("day", r.get("mday", 0)))))
        dd, w = after(fwD, d)
        if not w or dd in used:
            continue
        used.add(dd); n_ = after(fnD, d)[1]; s_ = after(swD, d)[1]
        years[Y] = dict(Y=num(r.get("sorg_DM")), WS=num(r.get("WStress")), NS=num(r.get("NStress")),
                        P=num(w.get("Precipitation")), I=num(w.get("Irrigation")),
                        D=num(w.get("Matrix percolation")), ET=num(w.get("Actual evapotranspiration")),
                        NL=num(n_.get("Matrix-Leaching")),
                        Nf=num(n_.get("Min-Surface-Fertilizer")) + num(n_.get("Min-Soil-Fertilizer"))
                           + num(n_.get("Org-Fertilizer")),
                        NU=num(n_.get("Crop-Uptake")),
                        Ecan=num(s_.get("Evaporation from canopy")), Esoil=num(s_.get("Evaporation of soil water")),
                        Tr=num(s_.get("Actual transpiration")))
    n = len(years)
    if not n:
        return OrderedDict(n_years=0), {}
    S = {k: sum(v[k] for v in years.values()) for k, _ in INDEX_NAMES}
    o = OrderedDict(n_years=n, first_harvest=min(years), last_harvest=max(years))
    for k, lab in INDEX_NAMES:
        o[lab] = round(S[k] / n, 3)
    ykg = S["Y"] * 1000
    o["IE_kg_m3"] = round(ykg / (S["I"] * 10), 3) if S["I"] > 0 else ""
    o["IWUE_kg_m3"] = ""
    o["DPF"] = round(S["D"] / (S["P"] + S["I"]), 4) if S["P"] + S["I"] > 0 else ""
    o["PFPn_kg_kg"] = round(ykg / S["Nf"], 2) if S["Nf"] > 0 else ""
    o["NLF"] = round(S["NL"] / S["Nf"], 4) if S["Nf"] > 0 else ""
    return o, {Y: v["Y"] for Y, v in years.items()}

def partner(exp, rid):
    """Rainfed simulation used for IWUE (same soil)."""
    m = re.match(r"(E\d+)_(S\d\d_[A-Za-z]+)_", rid + "_")
    if not m:
        return None
    soil = m.group(2)
    if exp.startswith("E6"):
        return ("E6_Mediterranean_Pollution", f"E6_{soil}_Baseline_Rainfed_N100")
    if exp.startswith("E5"):
        return ("E5_SHP_Dynamics", re.sub(r"_(Irrigated|Rainfed)$", "_Rainfed", rid))
    if exp.startswith("E13"):
        return ("E13_N_Water_Soil", re.sub(r"_W\d\d_[A-Za-z0-9_]+$", "_W01_Rainfed", rid))
    if exp.startswith(("E8", "E9", "E11", "E12", "E14", "E16")):
        return None      # weather / rain / temperature changed: no matching rainfed reference
    return ("E0_Baselines", f"E0_{soil}_Rainfed")


def header_scan(sim):
    """Pass 1: column layout of each output file of one simulation (header only)."""
    res = {}
    for p in sim["files"]:
        try:
            d = parse_dlf(p, header_only=True)
        except Exception:
            continue
        res[log_type(p, sim["rid"], d["meta"])] = labelled(d["cols"], d["units"])
    return res


# ----------------------------------------------------------------------------- one simulation
def date_key(cols, r):
    ix = {c: i for i, c in enumerate(cols)}
    def g(*names):
        for n in names:
            if n in ix:
                try:
                    return int(float(r[ix[n]]))
                except ValueError:
                    return 0
        return 0
    return (g("year"), g("month"), g("mday", "day"), g("hour"))

def collect_run(args):
    """Enter ONE simulation folder, read each of its own output files (each with its own header and
    values) and return: its rows (every date of every non-daily file, all values), its summary row,
    and its daily rows (only if asked)."""
    sim, want_daily = args
    exp, rid, folder = sim["exp"], sim["rid"], sim["folder"]
    soil, trt = treatment(rid)
    done = os.path.join(folder, "_DONE.txt")
    done_txt = open(done, encoding="latin-1").read().split("\n") if os.path.exists(done) and not sim["shared"] else []
    if done_txt:
        status = done_txt[0].strip()
    else:
        status = "ok" if sim["files"] else "no output files"

    parsed, problems = OrderedDict(), []
    for p in sim["files"]:
        try:
            d = parse_dlf(p)
        except Exception as e:
            problems.append(f"{os.path.basename(p)}: {e}")
            continue
        lt = log_type(p, rid, d["meta"])
        if lt in parsed:                          # same file type twice: keep both
            k = 2
            while f"{lt} ({k})" in parsed:
                k += 1
            lt = f"{lt} ({k})"
        parsed[lt] = (os.path.basename(p), d)

    # metadata of THIS simulation, read from the headers of its own files
    simfiles = sorted({re.split(r"[\\/]", d["meta"].get("SIMFILE", ""))[-1] for _, d in parsed.values()} - {""})
    sims = sorted({d["meta"].get("SIM", "") for _, d in parsed.values()} - {""})
    runs = sorted({d["meta"].get("RUN", "") for _, d in parsed.values()} - {""})
    vers = sorted({d["meta"].get("VERSION", "") for _, d in parsed.values()} - {""})
    ident = OrderedDict(experiment=exp, run_id=rid, soil=soil, treatment=trt,
                        SIMFILE="; ".join(simfiles), SIM="; ".join(sims),
                        daisy_RUN_time="; ".join(runs), daisy_VERSION="; ".join(vers))

    # ---- all values of all non-daily files, merged on date (one row per date)
    rows = OrderedDict(); daily_rows = OrderedDict()
    for lt, (fname, d) in parsed.items():
        daily = lt.startswith(("Daily", "Hourly")) or len(d["rows"]) > 400   # daily time step
        if daily and not want_daily:
            continue
        target = daily_rows if daily else rows
        seen = defaultdict(int)
        for r in d["rows"]:
            dk = date_key(d["cols"], r)
            seen[dk] += 1
            key = dk + (seen[dk],)                  # two harvests on the same day stay separate rows
            row = target.get(key)
            if row is None:
                row = OrderedDict(ident)
                row.update(date=f"{dk[0]:04d}-{dk[1]:02d}-{dk[2]:02d}", year=dk[0], month=dk[1], day=dk[2],
                           hour=dk[3], files_with_values_on_this_date="")
                target[key] = row
            row["files_with_values_on_this_date"] += ("; " if row["files_with_values_on_this_date"] else "") + lt
            for i, (c, u) in enumerate(zip(d["cols"], d["units"])):
                if c in DATE_COLS:
                    continue
                row[f"{lt} | {c} [{u}]" if u.strip() else f"{lt} | {c}"] = r[i]
    rows = [rows[k] for k in sorted(rows)]
    daily_rows = [daily_rows[k] for k in sorted(daily_rows)]

    # ---- summary of this simulation
    s = OrderedDict(ident)
    s["status"] = status
    s["run_seconds"] = done_txt[1].replace("s", "").strip() if len(done_txt) > 1 else ""
    s["folder"] = folder
    s["done_marker"] = "yes" if done_txt else "missing"
    s["n_output_files"] = len(parsed)
    s["output_files"] = "; ".join(parsed)
    s["file_read_problems"] = "; ".join(problems)
    for lt, (fname, d) in parsed.items():                 # each file's own header
        s[f"{lt} | file"] = fname
        for k in ("LOGFILE", "INTERVAL", "COLUMN", "CHEMICAL"):
            if d["meta"].get(k):
                s[f"{lt} | {k}"] = d["meta"][k]
        s[f"{lt} | rows"] = len(d["rows"])
    sett = dai_settings(folder, rid)
    for k, v in sett.items():
        s["set_" + k] = v
    idx, yields = indexes({k: v[1] for k, v in parsed.items()})
    if idx is None:
        if status not in ("not run", "no output files"):
            s["status"] += " | NO RESULTS"
        idx = OrderedDict()
    elif not idx.get("n_years"):
        s["status"] += " | NO COMPLETE YEARS"
    for k in ["n_years", "first_harvest", "last_harvest"] + [l for _, l in INDEX_NAMES] + \
             ["IE_kg_m3", "IWUE_kg_m3", "DPF", "PFPn_kg_kg", "NLF"]:
        s[k] = idx.get(k, "")
    ev = ""
    log = os.path.join(folder, "daisy.log")
    if os.path.exists(log):
        ev = open(log, encoding="latin-1").read().count("Irrigating")
    hmax = None
    for line in done_txt:
        if line.startswith("irrigation_events=") and ev == "":
            ev = int(num(line.split("=", 1)[1]))
        if line.startswith("h_max="):
            hmax = fnum(line.split("=", 1)[1])
    if "Daily-h" in parsed:
        d = parsed["Daily-h"][1]
        for r in d["rows"]:
            for x in r[4:]:
                v = fnum(x)
                if v is not None and (hmax is None or v > hmax):
                    hmax = v
    s["irrigation_events"] = ev
    s["h_max_cm"] = round(hmax, 2) if hmax is not None else ""
    if hmax is not None and hmax > 1e4:
        s["status"] += " | SOLVER_FAILURE (results not valid)"
    other = [x for x in simfiles if x.lower() != (rid + ".dai").lower()]
    if other:
        s["status"] += f" | OUTPUT_FROM_OTHER_SIM ({'; '.join(other)})"
    h = hashlib.md5()
    for lt in ("Annual-Harvest", "Annual-FWater_100cm", "Annual-FN_100cm"):
        if lt in parsed:
            for r in parsed[lt][1]["rows"]:
                h.update("\t".join(r).encode("latin-1", "ignore"))
    s["status_col_for_rows"] = s["status"]
    return rows, s, yields, (h.hexdigest() if parsed else ""), daily_rows


# ----------------------------------------------------------------------------- summaries
KEY_RESULTS = ["yield_Mg_ha", "irrigation_mm", "irrigation_events", "drainage_1m_mm", "ET_mm", "soil_evap_mm",
               "transpiration_mm", "water_stress_d", "N_leached_kg_ha", "IE_kg_m3", "IWUE_kg_m3", "DPF",
               "PFPn_kg_kg", "NLF"]
ROW_FIRST = ["experiment", "run_id", "soil", "treatment", "status", "SIMFILE", "SIM", "daisy_RUN_time",
             "daisy_VERSION", "date", "year", "month", "day", "hour", "files_with_values_on_this_date"]

def stats(v):
    m = sum(v) / len(v)
    sd = (sum((x - m) ** 2 for x in v) / (len(v) - 1)) ** 0.5 if len(v) > 1 else 0.0
    return m, sd

def order_cols(cols):
    """Identity / date columns first, then the files (annual first), each file's variables in file order."""
    first = [c for c in ROW_FIRST if c in cols]
    rest = [c for c in cols if c not in first]
    files = []
    for c in rest:
        f = c.split(" | ")[0]
        if f not in files:
            files.append(f)
    files.sort(key=lambda x: (not x.startswith("Annual"), x))
    return first + [c for f in files for c in rest if c.split(" | ")[0] == f]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="comma list of experiments, e.g. E0,E2")
    ap.add_argument("--root", help="folder to search (default: ./experiments, else this folder)")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    ap.add_argument("--out", default="Comprehensive_Summary")
    ap.add_argument("--daily", action="store_true",
                    help="also write the daily files (E0-E7) per experiment into Daily/ (very large)")
    a = ap.parse_args()
    OUT = a.out if os.path.isabs(a.out) else os.path.join(HERE, a.out)
    SUMD = os.path.join(OUT, "Experiment_Summaries"); DAYD = os.path.join(OUT, "Daily")
    os.makedirs(SUMD, exist_ok=True)

    root = a.root or (EXP if os.path.isdir(EXP) else HERE)
    root = root if os.path.isabs(root) else os.path.join(HERE, root)
    print(f"Searching every folder under {root} ...", flush=True)
    sims = discover(root, a.only)
    if not sims:
        sys.exit(f"No .dlf or .dai files found under {root}")
    by_exp = OrderedDict()
    for sm in sims:
        by_exp.setdefault(sm["exp"], []).append(sm)
    nd = sum(len(sm["files"]) for sm in sims)
    print(f"{len(sims)} simulations, {nd} .dlf files, {len(by_exp)} experiments. Output: {OUT}\n")

    t0 = time.time(); all_sum, all_yields, overview = [], {}, []
    ex = ProcessPoolExecutor(max_workers=a.workers) if a.workers > 1 else None
    mapper = (lambda fn, it: ex.map(fn, it, chunksize=4)) if ex else map
    try:
        for e, fl in by_exp.items():
            te = time.time(); lab = exp_label(e)
            print(f"{lab}: entering {len(fl)} simulations ({sum(len(x['files']) for x in fl)} .dlf files) ...", flush=True)
            # pass 1: the columns of this experiment (union of every file of every simulation)
            cols, dcols = [], []
            for res in mapper(header_scan, fl):
                for lt, lc in res.items():
                    target = dcols if lt.startswith(("Daily", "Hourly")) else cols
                    for c in lc:
                        if c.split(" [")[0] in DATE_COLS:
                            continue
                        k = f"{lt} | {c}"
                        if k not in target:
                            target.append(k)
            cols = order_cols(ROW_FIRST + cols); dcols = order_cols(ROW_FIRST + dcols)
            # pass 2: every simulation -> its rows go straight into the experiment CSV
            fh = open(os.path.join(OUT, f"{lab}.csv"), "w", newline="", encoding=ENC)
            w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore", restval=""); w.writeheader()
            dw = dfh = None
            if a.daily:
                os.makedirs(DAYD, exist_ok=True)
                dfh = open(os.path.join(DAYD, f"{lab}_daily.csv"), "w", newline="", encoding=ENC)
                dw = csv.DictWriter(dfh, fieldnames=dcols, extrasaction="ignore", restval=""); dw.writeheader()
            sums, fps, nrows = [], defaultdict(list), 0
            for k, (rows, s, yields, fp, drows) in enumerate(mapper(collect_run, [(sm, a.daily) for sm in fl]), 1):
                for r in rows:
                    r["status"] = s["status"]
                w.writerows(rows); nrows += len(rows)
                if dw and drows:
                    for r in drows:
                        r["status"] = s["status"]
                    dw.writerows(drows)
                s.pop("status_col_for_rows", None)
                sums.append(s); all_yields[(e, s["run_id"])] = yields
                if fp:
                    fps[fp].append(s["run_id"])
                if k % 200 == 0:
                    print(f"   {k}/{len(fl)}", flush=True)
            fh.close()
            if dfh:
                dfh.close()
            # identical results inside the experiment, IWUE against the rainfed partner
            twin = {}
            for rr in fps.values():
                if len(rr) > 1:
                    for x in rr:
                        twin[x] = "; ".join(y for y in rr if y != x)[:500]
            seen_rid = defaultdict(list)
            for s in sums:
                seen_rid[s["run_id"]].append(s["folder"])
            for s in sums:
                s["identical_output_to"] = twin.get(s["run_id"], "")
                s["same_run_id_also_in"] = "; ".join(f for f in seen_rid[s["run_id"]] if f != s["folder"])
                p = partner(e, s["run_id"]); y = all_yields.get((e, s["run_id"]), {})
                py = all_yields.get(p, {}) if p else {}
                common = [Y for Y in y if Y in py]
                irr = fnum(s.get("irrigation_mm")) or 0
                if common and irr and s.get("n_years"):
                    dy = sum(y[Y] - py[Y] for Y in common) * 1000; I = irr * s["n_years"] * 10
                    s["IWUE_kg_m3"] = round(dy / I, 3) if I > 0 else ""
                s["rainfed_partner"] = p[1] if p else ""
            write_dicts(os.path.join(SUMD, f"{lab}_SUMMARY.csv"), sums)
            all_sum += sums

            valid = [s for s in sums if s["status"] == "ok"]
            ov = OrderedDict(experiment=lab, expected=EXPECTED.get(e.split("_")[0], ""), simulations_found=len(sums),
                             valid_ok=len(valid), solver_failure=sum("SOLVER" in s["status"] for s in sums),
                             not_run=sum(s["status"] in ("not run", "no output files") for s in sums),
                             other_problem=sum(s["status"] not in ("ok", "not run", "no output files")
                                               and "SOLVER" not in s["status"]
                                               for s in sums),
                             identical_results=len([s for s in sums if s["identical_output_to"]]),
                             dlf_files_read=sum(s["n_output_files"] for s in sums),
                             output_files_per_simulation=f"{min(s['n_output_files'] for s in sums)}-"
                                                         f"{max(s['n_output_files'] for s in sums)}",
                             rows_in_experiment_csv=nrows, columns_in_experiment_csv=len(cols))
            for c in KEY_RESULTS:
                v = [x for x in (fnum(s.get(c, "")) for s in valid) if x is not None]
                if v:
                    m, sd = stats(v)
                    ov[c + "_mean"], ov[c + "_sd"] = round(m, 4), round(sd, 4)
                    ov[c + "_min"], ov[c + "_max"] = round(min(v), 4), round(max(v), 4)
            overview.append(ov)
            print(f"   -> {lab}.csv ({nrows} rows x {len(cols)} columns) + {lab}_SUMMARY.csv | "
                  f"ok {ov['valid_ok']}, solver failures {ov['solver_failure']}, not run {ov['not_run']}, "
                  f"other {ov['other_problem']} | {time.time()-te:.0f} s", flush=True)
    finally:
        if ex:
            ex.shutdown()

    tot = OrderedDict(experiment="TOTAL", expected=sum(EXPECTED.values()) if not a.only else "",
                      **{k: sum(o[k] for o in overview) for k in
                         ("simulations_found", "valid_ok", "solver_failure", "not_run", "other_problem",
                          "identical_results", "dlf_files_read", "rows_in_experiment_csv")})
    write_dicts(os.path.join(OUT, "00_SUMMARY_ALL_EXPERIMENTS.csv"), overview + [tot])
    keep = [k for k in all_sum[0] if " | " not in k] if all_sum else []
    for s in all_sum:
        for k in s:
            if " | " not in k and k not in keep:
                keep.append(k)
    write_dicts(os.path.join(OUT, "00_summary_all_simulations.csv"), all_sum, keep)
    with open(os.path.join(OUT, "00_README.txt"), "w", encoding="utf-8") as fh:
        fh.write(__doc__.strip() + "\n\n")
        fh.write(f"Made {time.strftime('%Y-%m-%d %H:%M')}: {tot['simulations_found']} simulations, "
                 f"{tot['valid_ok']} valid, {tot['solver_failure']} solver failures, {tot['not_run']} not run, "
                 f"{tot['other_problem']} other problems.\n")
    print(f"\nDone in {(time.time()-t0)/60:.1f} min. {tot['simulations_found']} simulations: {tot['valid_ok']} ok, "
          f"{tot['solver_failure']} solver failures, {tot['not_run']} not run, {tot['other_problem']} other.")
    print("Results in", OUT)

if __name__ == "__main__":
    main()
