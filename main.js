// ── Labels ────────────────────────────────────────────────────────────────────
const labels = [
  "analyst_error",
  "instrument_malfunction",

  "standard_reagent_issue",
  "raw_material_deviation",
  "process_variation",
  "equipment_failure",
  "environmental_condition",
  "sampling_error",
];
const ROOT_CAUSES = [
  "analyst_error",
  "instrument_malfunction",
  "standard_reagent_issue",
  "raw_material_deviation",
  "process_variation",
  "equipment_failure",
  "environmental_condition",
  "sampling_error",
];

function getVal(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function getFlag(id) {
  return document.getElementById(id).checked ? 1 : 0;
}

function getSelect(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}
document.getElementById("run-btn").addEventListener("click", runAnalysis);

// ── Build feature array (124 features — must match training order) ─────────────
function buildFeatures() {
  // ── Direct inputs ──────────────────────────────────────────────────────────
  const assay = getVal("assay_percent");
  const ph = getVal("ph_value");
  const dissolution = getVal("dissolution_percent");
  const moisture = getVal("moisture_content_percent");
  const potency = getVal("potency_percent");
  const uniformity = getVal("uniformity_percent");
  const shaft_wobble = getVal("shaft_wobble_mm");
  const rpm_actual = getVal("rpm_actual");
  const rpm_set = getVal("rpm_set");
  const last_cal = getVal("last_calibration_days");
  const instr_age = getVal("instrument_age_years");
  const instr_type = getSelect("instrument_type");
  const bath_actual = getVal("temperature_bath_actual_c");
  const bath_set = getVal("temperature_bath_set_c");
  const svc_days = getVal("instrument_service_days");
  const lab_temp = getVal("lab_temperature_c");
  const lab_hum = getVal("lab_humidity_percent");
  const storage_temp = getVal("storage_temperature_c");
  const api_purity = getVal("api_purity_percent");
  const rm_age = getVal("raw_material_age_days");
  const std_expiry = getVal("standard_expiry_days");
  const exp_yrs = getVal("analyst_experience_years");
  const fatigue = getVal("analyst_fatigue_hours");
  const shift = getSelect("shift");
  const test_type = getSelect("test_type");

  // ── Flags ─────────────────────────────────────────────────────────────────
  const instr_cal = getFlag("instrument_calibrated");
  const retest_diff = getFlag("retest_result_different");
  const coa = getFlag("coa_passed");
  const sop = getFlag("sop_followed");
  const supplier_chg = getFlag("supplier_change_flag");
  const equip_mal = getFlag("equipment_malfunction_flag");
  const hplc_suit = getFlag("hplc_system_suitability_pass");
  const bal_cal = getFlag("balance_calibrated");
  const ph_cal = getFlag("ph_meter_calibrated");
  const app_aligned = getFlag("dissolution_apparatus_aligned");
  const filter_ok = getFlag("filter_integrity_passed");
  const calc_chk = getFlag("calculation_checked");
  const second_an = getFlag("second_analyst_verified");
  const rm_approved = getFlag("raw_material_approved");
  const retest_diff_an = getFlag("retest_by_different_analyst");
  // ✅ FIX: was hardcoded norm(1) — now reads actual toggle at position 70
  const excipient_grade = getFlag("excipient_grade_correct");

  // ── Derived features ───────────────────────────────────────────────────────
  const assay_deviation = assay - 100; // deviation from 100%
  const ph_deviation = ph - 6.5; // deviation from neutral pharma pH
  const dissolution_deviation = dissolution - 80; // deviation from 80% spec
  const moisture_deviation = moisture - 2.0; // deviation from 2% target
  const uniformity_deviation = uniformity - 100; // deviation from 100%
  const hardness_kp = 10; // default midrange
  const hardness_deviation = 0;
  const result_vs_lower = assay - 98; // distance from lower spec (98%)
  const result_vs_upper = 102 - assay; // distance from upper spec (102%)
  const viscosity = 100; // default
  const friability = 0.5; // default
  const disintegration = 15; // default
  const particle_size = 150; // default
  const bulk_density = 0.6; // default
  const tapped_density = 0.8; // default
  const water_activity = 0.4; // default
  const osmolality = 300; // default
  const sterility = 1; // assume pass
  const endotoxin = 0.5; // default low
  const clarity = 1; // default clear
  const color_index = 0; // default no deviation
  const odor_flag = 0; // default no odor
  const cal_due_flag = last_cal > 180 ? 1 : 0;
  const storage_humidity = 45; // default
  const cleanroom_grade = 3; // default grade C
  const hvac_mal = lab_temp > 27 ? 1 : 0;
  const light_exposure = 200; // default lux
  const pressure_diff = 15; // default pa
  const rm_moisture = 2.0; // default
  const particle_raw = 100; // default
  const supplier_audit = coa; // if CoA passed, audit likely passed
  const retest_exceeded = rm_age > 150 ? 1 : 0;
  const quarantine = rm_approved;
  const vendor_dev = supplier_chg;
  const batch_size = 200; // default kg
  const mixing_time = 30; // default min
  const mixing_speed = 50; // default rpm
  const compression = 12; // default kN
  const ejection = 2; // default kN
  const coating_thick = 1; // default mm
  const coating_gain = 3; // default %
  const gran_moisture = 3; // default %
  const drying_temp = 60; // default C
  const drying_time = 60; // default min
  const inlet_temp = 65; // default C
  const spray_rate = 20; // default g/min
  const bed_temp = 45; // default C
  const proc_dev = equip_mal; // if equipment malfunction, process affected
  const yield_pct = 95; // default %
  const blend_rsd = 2; // default RSD
  const sterilization = 1; // default validated
  const sample_size = 10; // default units
  const sample_homo = 1; // default homogeneous
  const sampling_loc = 3; // default middle
  const container_ok = 1; // default ok
  const sample_age = 2; // default hours
  const sample_storage = 1; // default correct
  const composite = 0; // default not composite
  const samp_sop = sop; // same as general SOP
  const reagent_ok = hplc_suit; // if HPLC passes, reagent likely ok
  const std_conc_ok = instr_cal; // if instrument cal ok, std conc ok
  const ref_cert = coa; // if CoA ok, ref certified
  const mobile_fresh = 1; // default fresh
  const solvent_grade = 1; // default correct
  const reagent_storage = 1; // default correct
  const std_prep = calc_chk; // if calculation checked, prep verified
  const prev_oos = 0; // default no previous OOS
  const batch_seq = 500; // default midrange
  const product_age = 6; // default months
  const stability_tp = 0; // default initial
  const batch_size_dev = 0; // default no deviation
  const prev_batch_oos = 0; // default no
  const complaints = 0; // default none
  const annual_rev = 1; // default reviewed
  const change_ctrl = 0; // default no open CC
  const validation = 1; // default validated
  const phase_invest = retest_diff ? 1 : 2;
  const num_retests = retest_diff ? 1 : 0;
  const analyst_err_flag = sop === 0 || calc_chk === 0 ? 1 : 0;
  const analyst_id = 1; // default
  const training_current = exp_yrs > 2 ? 1 : 0;

  // ── Normalize (clamp 0-1000, divide by 1000 — same as training) ──────────
  function norm(v) {
    return Math.max(0, Math.min(1000, v)) / 1000;
  }

  // ── Feature array — 124 entries, exact training order ────────────────────
  return [
    // [1–20] Test results
    norm(assay),
    norm(ph),
    norm(dissolution),
    norm(moisture),
    norm(viscosity),
    norm(potency),
    norm(uniformity),
    norm(hardness_kp),
    norm(friability),
    norm(disintegration),
    norm(particle_size),
    norm(bulk_density),
    norm(tapped_density),
    norm(water_activity),
    norm(osmolality),
    norm(sterility),
    norm(endotoxin),
    norm(clarity),
    norm(color_index),
    norm(odor_flag),
    // [21–28] Deviation metrics (offset by 500 to handle negatives)
    // [21–28] Deviation metrics — no offset needed
    norm(assay_deviation),
    norm(ph_deviation),
    norm(dissolution_deviation),
    norm(moisture_deviation),
    norm(uniformity_deviation),
    norm(hardness_deviation),
    norm(result_vs_lower),
    norm(result_vs_upper),
    // [29–44] Instrument / equipment
    norm(instr_cal),
    norm(instr_age),
    norm(last_cal),
    norm(cal_due_flag),
    norm(equip_mal),
    norm(hplc_suit),
    norm(bal_cal),
    norm(ph_cal),
    norm(app_aligned),
    norm(shaft_wobble),
    norm(rpm_actual),
    norm(rpm_set),
    norm(bath_actual),
    norm(bath_set),
    norm(svc_days),
    norm(instr_type),
    // [45–54] Analyst / human
    norm(exp_yrs),
    norm(analyst_err_flag),
    norm(shift),
    norm(training_current),
    norm(fatigue),
    norm(sop),
    norm(calc_chk),
    norm(second_an),
    norm(retest_diff_an),
    norm(analyst_id),
    // [55–64] Environmental
    norm(lab_temp),
    norm(lab_hum),
    norm(lab_temp > 27 ? 1 : 0), // temperature_excursion_flag
    norm(lab_hum > 65 ? 1 : 0), // humidity_excursion_flag
    norm(storage_temp),
    norm(storage_humidity),
    norm(cleanroom_grade),
    norm(hvac_mal),
    norm(light_exposure),
    norm(pressure_diff),
    // [65–76] Raw material
    norm(rm_approved),
    norm(supplier_chg),
    norm(rm_age),
    norm(coa),
    norm(api_purity),
    norm(excipient_grade), // ✅ FIX: position 70 — was norm(1), now reads toggle
    norm(rm_moisture),
    norm(particle_raw),
    norm(supplier_audit),
    norm(retest_exceeded),
    norm(quarantine),
    norm(vendor_dev),
    // [77–94] Process parameters
    norm(batch_size),
    norm(mixing_time),
    norm(mixing_speed),
    norm(compression),
    norm(ejection),
    norm(coating_thick),
    norm(coating_gain),
    norm(gran_moisture),
    norm(drying_temp),
    norm(drying_time),
    norm(inlet_temp),
    norm(spray_rate),
    norm(bed_temp),
    norm(proc_dev),
    norm(yield_pct),
    norm(blend_rsd),
    norm(filter_ok),
    norm(sterilization),
    // [95–102] Sampling
    norm(sample_size),
    norm(sample_homo),
    norm(sampling_loc),
    norm(container_ok),
    norm(sample_age),
    norm(sample_storage),
    norm(composite),
    norm(samp_sop),
    // [103–110] Standard / reagent
    norm(std_expiry + 30), // offset to handle negative expiry days
    norm(reagent_ok),
    norm(std_conc_ok),
    norm(ref_cert),
    norm(mobile_fresh),
    norm(solvent_grade),
    norm(reagent_storage),
    norm(std_prep),
    // [111–124] History / batch
    norm(prev_oos),
    norm(batch_seq),
    norm(product_age),
    norm(stability_tp),
    norm(batch_size_dev + 10), // offset to handle negative deviation
    norm(prev_batch_oos),
    norm(complaints),
    norm(annual_rev),
    norm(change_ctrl),
    norm(validation),
    norm(test_type),
    norm(phase_invest),
    norm(retest_diff),
    norm(num_retests),

    // NOTE: oos_confirmed_flag (125th training column) intentionally excluded
    // from model — architecture is 124 inputs
  ];
}

// ── Signal detection ──────────────────────────────────────────────────────────
function getSignals(cause) {
  const signals = [];

  const shaft = getVal("shaft_wobble_mm");
  const rpmA = getVal("rpm_actual");
  const rpmS = getVal("rpm_set");
  const lastCal = getVal("last_calibration_days");
  const labTemp = getVal("lab_temperature_c");
  const labHum = getVal("lab_humidity_percent");
  const rmAge = getVal("raw_material_age_days");
  const apiPur = getVal("api_purity_percent");
  const stdExp = getVal("standard_expiry_days");
  const assay = getVal("assay_percent");
  const dissolution = getVal("dissolution_percent");
  const exp = getVal("analyst_experience_years");
  const fatigue = getVal("analyst_fatigue_hours");

  // assay / dissolution
  const assayDev = Math.abs(assay - 100);
  if (assayDev > 5)
    signals.push({
      text: "Assay deviation from spec",
      val: `${assayDev.toFixed(1)}%`,
      level: "danger",
    });
  if (dissolution < 75)
    signals.push({
      text: "Low dissolution",
      val: `${dissolution}%`,
      level: "danger",
    });

  // equipment
  if (shaft > 1.0)
    signals.push({
      text: "Shaft wobble detected",
      val: `${shaft} mm`,
      level: "danger",
    });
  if (Math.abs(rpmA - rpmS) > 10)
    signals.push({
      text: "RPM deviation from set point",
      val: `${rpmA} / ${rpmS} set`,
      level: "danger",
    });
  if (lastCal > 180)
    signals.push({
      text: "Calibration overdue",
      val: `${lastCal} days`,
      level: "warn",
    });
  if (!getFlag("dissolution_apparatus_aligned"))
    signals.push({
      text: "Dissolution apparatus misaligned",
      val: "check alignment",
      level: "danger",
    });
  if (!getFlag("filter_integrity_passed"))
    signals.push({
      text: "Filter integrity failed",
      val: "replace filter",
      level: "danger",
    });
  if (!getFlag("instrument_calibrated"))
    signals.push({
      text: "Instrument not calibrated",
      val: "calibrate now",
      level: "danger",
    });
  if (!getFlag("balance_calibrated"))
    signals.push({
      text: "Balance not calibrated",
      val: "calibrate now",
      level: "warn",
    });

  // analyst
  if (!getFlag("sop_followed"))
    signals.push({
      text: "SOP not followed",
      val: "review protocol",
      level: "danger",
    });
  if (!getFlag("calculation_checked"))
    signals.push({
      text: "Calculation not verified",
      val: "double check",
      level: "warn",
    });
  if (!getFlag("second_analyst_verified"))
    signals.push({
      text: "No second analyst verification",
      val: "get sign-off",
      level: "warn",
    });
  if (exp < 2)
    signals.push({
      text: "Junior analyst",
      val: `${exp} yrs experience`,
      level: "warn",
    });
  if (fatigue > 8)
    signals.push({
      text: "High analyst fatigue",
      val: `${fatigue}h shift`,
      level: "warn",
    });

  // environment
  if (labTemp > 27)
    signals.push({
      text: "Lab temperature excursion",
      val: `${labTemp}°C`,
      level: "danger",
    });
  if (labHum > 65)
    signals.push({
      text: "Humidity excursion",
      val: `${labHum}%`,
      level: "danger",
    });

  // raw material
  if (!getFlag("coa_passed"))
    signals.push({
      text: "CoA failed",
      val: "check supplier",
      level: "danger",
    });
  if (getFlag("supplier_change_flag"))
    signals.push({
      text: "Supplier change detected",
      val: "review records",
      level: "warn",
    });
  if (rmAge > 150)
    signals.push({
      text: "Raw material age exceeds limit",
      val: `${rmAge} days`,
      level: "warn",
    });
  if (apiPur < 98)
    signals.push({
      text: "API purity below target",
      val: `${apiPur}%`,
      level: "danger",
    });
  // ✅ NEW: signal for excipient grade
  if (!getFlag("excipient_grade_correct"))
    signals.push({
      text: "Excipient grade incorrect",
      val: "check purchase order vs spec",
      level: "danger",
    });

  // standard
  if (stdExp < 0)
    signals.push({
      text: "Standard expired",
      val: `${Math.abs(stdExp)} days ago`,
      level: "danger",
    });
  if (!getFlag("hplc_system_suitability_pass"))
    signals.push({
      text: "HPLC system suitability failed",
      val: "recheck system",
      level: "danger",
    });

  // good signals
  if (getFlag("coa_passed"))
    signals.push({ text: "CoA passed", val: "approved", level: "ok" });
  if (labTemp <= 25 && labHum <= 60)
    signals.push({
      text: "Environmental conditions",
      val: "normal",
      level: "ok",
    });

  return signals.slice(0, 6);
}

// ── Render result ─────────────────────────────────────────────────────────────
function renderOutput(
  main_label,
  confidences,
  key_signals,
  key_signals_confidence,
) {
  // ── 1. Main label + subtitle ──────────────────────────────────────────────
  document.getElementById("r-cause").textContent = main_label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // ── 2. Top confidence bar ─────────────────────────────────────────────────
  const topConf = confidences[0].pct;
  const bar = document.getElementById("r-conf-bar");
  bar.style.width = topConf + "%";
  bar.style.background =
    topConf >= 75
      ? "var(--accent)"
      : topConf >= 50
        ? "var(--warn)"
        : "var(--danger)";
  document.getElementById("r-conf-pct").textContent = topConf + "%";

  // ── 3. Probability distribution (top 3 + other) ───────────────────────────
  const probsEl = document.getElementById("r-probs");
  probsEl.innerHTML = "";

  const top3 = confidences.slice(0, 3);
  const otherPct = confidences.slice(3).reduce((sum, p) => sum + p.pct, 0);

  [...top3, { cause: "other_causes", pct: otherPct }].forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "prob-row";
    row.innerHTML = `
      <div class="prob-label">${p.cause.replace(/_/g, " ")}</div>
      <div class="prob-track">
        <div class="${i === 0 ? "prob-fill-top" : "prob-fill-low"}"
             style="width:${p.pct}%"></div>
      </div>
      <div class="prob-pct">${p.pct}%</div>
    `;
    probsEl.appendChild(row);
  });

  // ── 4. Key signals = other root causes + their confidences ───────────────
  const sigsEl = document.getElementById("r-signals");
  sigsEl.innerHTML = "";

  key_signals.forEach((sig) => {
    const color = { danger: "#ff4444", warn: "#ffaa00", ok: "#00d4aa" }[
      sig.level
    ];
    const row = document.createElement("div");
    row.className = "signal";
    row.innerHTML = `
      <div class="sig-dot" style="background:${color}"></div>
      <div class="sig-text">${sig.text}</div>
      <div class="sig-val">${sig.val}</div>
    `;
    sigsEl.appendChild(row);
  });

  // ── 5. Recommendation message ─────────────────────────────────────────────

  // ── 6. Swap panels ────────────────────────────────────────────────────────
  document.getElementById("result-empty").style.display = "none";
  document.getElementById("result-content").style.display = "block";
}

// ── Run analysis ──────────────────────────────────────────────────────────────
async function runAnalysis() {
  const features = buildFeatures();
  console.assert(
    features.length === 124,
    `Expected 124, got ${features.length}`,
  );

  const res = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });

  const { predictedLabel, predictedOutput, predicted } = await res.json();

  const mainConfidence = Math.round(predictedOutput[predicted] * 100);

  const confidences = labels
    .map((cause, i) => ({ cause, pct: Math.round(predictedOutput[i] * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const sortedWithMain = [
    { cause: predictedLabel, pct: mainConfidence },
    ...confidences.filter((c) => c.cause !== predictedLabel),
  ];

  const detectedSignals = getSignals(predictedLabel);
  renderOutput(predictedLabel, sortedWithMain, detectedSignals, []);

  const countEl = document.getElementById("inv-count");
  countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
}
// ── Export report ─────────────────────────────────────────────────────────────
function exportReport() {
  const cause = document.getElementById("r-cause").textContent;
  const conf = document.getElementById("r-conf-pct").textContent;
  const msg = document.getElementById("r-msg").textContent;
  const batch = document.getElementById("batch_no").value;
  const product = document.getElementById("product_name").value;
  const date = new Date().toISOString();

  const report = {
    date,
    batch_number: batch,
    product,
    predicted_root_cause: cause,
    confidence: conf,
    recommendation: msg,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `oos_report_${batch}_${date.slice(0, 10)}.json`;
  a.click();
}
