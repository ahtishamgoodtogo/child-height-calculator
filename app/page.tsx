"use client";

import { useMemo, useState } from "react";
import {
  estimatedRangeCm,
  MAX_AGE,
  MIN_AGE,
  predictAdultHeightCm,
  type ChildSex,
} from "../lib/khamisRoche";

type Unit = "cm" | "ft";

type FieldKey =
  | "age"
  | "childHeight"
  | "weight"
  | "fatherHeight"
  | "motherHeight"
  | "gender";

type FieldErrors = Partial<Record<FieldKey, string>>;

const AAHG_MIN_CM = 5;
const AAHG_MAX_CM = 9;

const AGE_OPTIONS = Array.from(
  { length: Math.round((MAX_AGE - MIN_AGE) / 0.5) + 1 },
  (_, i) => Number((MIN_AGE + i * 0.5).toFixed(1))
);

const REQUIRED_MARK = (
  <span className="ml-0.5 text-red-600" aria-hidden="true">
    *
  </span>
);

function inputClassName(hasError: boolean, extra = "") {
  return `w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-gray-900 focus:ring-gray-200"
  } ${extra}`;
}

function feetInchesToCm(feet: number, inches: number) {
  return (feet * 12 + inches) * 2.54;
}

function cmToFeetInches(cm: number) {
  const totalInches = cm / 2.54;

  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);

  // Handle rounding such as 5 ft 12 in
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
}

function kgToLb(kg: number) {
  return kg * 2.2046226218;
}

function lbToKg(lb: number) {
  return lb / 2.2046226218;
}

export default function ChildHeightCalculatorPage() {
  const [unit, setUnit] = useState<Unit>("cm");
  const [gender, setGender] = useState<ChildSex>("boy");

  const [age, setAge] = useState("");
  const [childCm, setChildCm] = useState("");
  const [childFeet, setChildFeet] = useState("");
  const [childInches, setChildInches] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [weightLb, setWeightLb] = useState("");

  const [fatherCm, setFatherCm] = useState("");
  const [motherCm, setMotherCm] = useState("");

  const [fatherFeet, setFatherFeet] = useState("");
  const [fatherInches, setFatherInches] = useState("");

  const [motherFeet, setMotherFeet] = useState("");
  const [motherInches, setMotherInches] = useState("");

  const [usingAAHG, setUsingAAHG] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const resultImperial = useMemo(() => {
    if (result === null) return null;
    return cmToFeetInches(result);
  }, [result]);

  const rangeCm = estimatedRangeCm(gender);
  const minHeight = result !== null ? result - rangeCm : null;
  const maxHeight = result !== null ? result + rangeCm : null;

  const aahgMin = result !== null && usingAAHG ? result + AAHG_MIN_CM : null;
  const aahgMax = result !== null && usingAAHG ? result + AAHG_MAX_CM : null;

  function clearFieldError(field: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function isValidParentHeight(cm: number) {
    return Number.isFinite(cm) && cm >= 100 && cm <= 250;
  }

  function isValidChildHeight(cm: number) {
    return Number.isFinite(cm) && cm >= 80 && cm <= 220;
  }

  function isValidWeightKg(kg: number) {
    return Number.isFinite(kg) && kg >= 10 && kg <= 150;
  }

  function parseHeightPair(
    feetValue: string,
    inchesValue: string
  ): { ok: true; cm: number } | { ok: false; message: string } {
    if (feetValue === "" || inchesValue === "") {
      return { ok: false, message: "This field is required." };
    }

    const feet = Number(feetValue);
    const inches = Number(inchesValue);

    if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
      return { ok: false, message: "Please enter valid numbers." };
    }

    if (feet < 0 || inches < 0 || inches >= 12) {
      return { ok: false, message: "Inches must be between 0 and 11." };
    }

    return { ok: true, cm: feetInchesToCm(feet, inches) };
  }

  function calculateHeight() {
    setResult(null);

    const errors: FieldErrors = {};

    let ageYears = NaN;
    let childHeightCm = NaN;
    let childWeightKg = NaN;
    let fatherHeightCm = NaN;
    let motherHeightCm = NaN;

    if (!age.trim()) {
      errors.age = "This field is required.";
    } else {
      ageYears = Number(age);
      if (!Number.isFinite(ageYears)) {
        errors.age = "Please enter a valid age.";
      } else if (ageYears < MIN_AGE || ageYears > MAX_AGE) {
        errors.age = `Age must be between ${MIN_AGE} and ${MAX_AGE} years.`;
      }
    }

    if (!gender) {
      errors.gender = "This field is required.";
    }

    if (unit === "cm") {
      if (!childCm.trim()) {
        errors.childHeight = "This field is required.";
      } else {
        childHeightCm = Number(childCm);
        if (!isValidChildHeight(childHeightCm)) {
          errors.childHeight =
            "Enter a realistic height between 80 cm and 220 cm.";
        }
      }

      if (!weightKg.trim()) {
        errors.weight = "This field is required.";
      } else {
        childWeightKg = Number(weightKg);
        if (!isValidWeightKg(childWeightKg)) {
          errors.weight = "Enter a realistic weight between 10 kg and 150 kg.";
        }
      }

      if (!fatherCm.trim()) {
        errors.fatherHeight = "This field is required.";
      } else {
        fatherHeightCm = Number(fatherCm);
        if (!isValidParentHeight(fatherHeightCm)) {
          errors.fatherHeight =
            "Enter a realistic height between 100 cm and 250 cm.";
        }
      }

      if (!motherCm.trim()) {
        errors.motherHeight = "This field is required.";
      } else {
        motherHeightCm = Number(motherCm);
        if (!isValidParentHeight(motherHeightCm)) {
          errors.motherHeight =
            "Enter a realistic height between 100 cm and 250 cm.";
        }
      }
    } else {
      const childHeight = parseHeightPair(childFeet, childInches);
      if (!childHeight.ok) {
        errors.childHeight = childHeight.message;
      } else if (!isValidChildHeight(childHeight.cm)) {
        errors.childHeight =
          "Enter a realistic height between 80 cm and 220 cm.";
      } else {
        childHeightCm = childHeight.cm;
      }

      if (!weightLb.trim()) {
        errors.weight = "This field is required.";
      } else {
        const weight = Number(weightLb);
        if (!Number.isFinite(weight)) {
          errors.weight = "Please enter a valid weight.";
        } else {
          childWeightKg = lbToKg(weight);
          if (!isValidWeightKg(childWeightKg)) {
            errors.weight =
              "Enter a realistic weight between 10 kg and 150 kg.";
          }
        }
      }

      const fatherHeight = parseHeightPair(fatherFeet, fatherInches);
      if (!fatherHeight.ok) {
        errors.fatherHeight = fatherHeight.message;
      } else if (!isValidParentHeight(fatherHeight.cm)) {
        errors.fatherHeight =
          "Enter a realistic height between 100 cm and 250 cm.";
      } else {
        fatherHeightCm = fatherHeight.cm;
      }

      const motherHeight = parseHeightPair(motherFeet, motherInches);
      if (!motherHeight.ok) {
        errors.motherHeight = motherHeight.message;
      } else if (!isValidParentHeight(motherHeight.cm)) {
        errors.motherHeight =
          "Enter a realistic height between 100 cm and 250 cm.";
      } else {
        motherHeightCm = motherHeight.cm;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const estimatedHeight = predictAdultHeightCm({
      sex: gender,
      ageYears,
      childHeightCm,
      childWeightKg,
      fatherHeightCm,
      motherHeightCm,
    });

    setResult(estimatedHeight);
  }

  function resetCalculator() {
    setAge("");
    setChildCm("");
    setChildFeet("");
    setChildInches("");
    setWeightKg("");
    setWeightLb("");
    setFatherCm("");
    setMotherCm("");
    setFatherFeet("");
    setFatherInches("");
    setMotherFeet("");
    setMotherInches("");
    setUsingAAHG(false);
    setResult(null);
    setFieldErrors({});
  }

  function switchUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;

    // Convert child weight between metric and imperial when switching units
    if (nextUnit === "ft" && weightKg) {
      const kg = Number(weightKg);
      if (Number.isFinite(kg)) {
        setWeightLb((Math.round(kgToLb(kg) * 10) / 10).toString());
      }
    } else if (nextUnit === "cm" && weightLb) {
      const lb = Number(weightLb);
      if (Number.isFinite(lb)) {
        setWeightKg((Math.round(lbToKg(lb) * 10) / 10).toString());
      }
    }

    setUnit(nextUnit);
    setResult(null);
    setFieldErrors({});
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Child Height Calculator – Estimate Adult Height
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Estimate a child&apos;s potential adult height with the
              Khamis-Roche method using age, current height, weight, and
              parents&apos; heights.
            </p>
          </header>

          {/* Unit selector */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Height &amp; weight units
            </p>

            <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchUnit("cm")}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                  unit === "cm"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                cm / kg
              </button>

              <button
                type="button"
                onClick={() => switchUnit("ft")}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                  unit === "ft"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                ft / lb
              </button>
            </div>
          </div>

          <p className="mb-4 text-xs text-gray-500">
            Fields marked with <span className="text-red-600">*</span> are
            required.
          </p>

          <div className="space-y-5">
            {/* Current age */}
            <div>
              <label
                htmlFor="age"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Current Age
                {REQUIRED_MARK}
              </label>

              <select
                id="age"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  clearFieldError("age");
                }}
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.age)}
                aria-describedby={fieldErrors.age ? "age-error" : undefined}
                aria-label="Child's current age in years"
                className={inputClassName(Boolean(fieldErrors.age), "bg-white")}
              >
                <option value="" disabled>
                  Select age
                </option>
                {AGE_OPTIONS.map((years) => (
                  <option key={years} value={String(years)}>
                    {years.toFixed(1)} years
                  </option>
                ))}
              </select>

              {fieldErrors.age ? (
                <p id="age-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.age}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Ages {MIN_AGE}–{MAX_AGE} years, in 0.5-year steps.
                </p>
              )}
            </div>

            {/* Current height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Current Height
                {REQUIRED_MARK}
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={childCm}
                    onChange={(e) => {
                      setChildCm(e.target.value);
                      clearFieldError("childHeight");
                    }}
                    placeholder="140"
                    min="80"
                    max="220"
                    step="0.1"
                    required
                    inputMode="decimal"
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.childHeight)}
                    aria-describedby={
                      fieldErrors.childHeight ? "child-height-error" : undefined
                    }
                    aria-label="Child's current height in centimeters"
                    className={inputClassName(
                      Boolean(fieldErrors.childHeight),
                      "pr-12"
                    )}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={childFeet}
                      onChange={(e) => {
                        setChildFeet(e.target.value);
                        clearFieldError("childHeight");
                      }}
                      placeholder="4"
                      min="0"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.childHeight)}
                      aria-label="Child's height feet"
                      className={inputClassName(
                        Boolean(fieldErrors.childHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={childInches}
                      onChange={(e) => {
                        setChildInches(e.target.value);
                        clearFieldError("childHeight");
                      }}
                      placeholder="7"
                      min="0"
                      max="11"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.childHeight)}
                      aria-describedby={
                        fieldErrors.childHeight
                          ? "child-height-error"
                          : undefined
                      }
                      aria-label="Child's height inches"
                      className={inputClassName(
                        Boolean(fieldErrors.childHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}

              {fieldErrors.childHeight && (
                <p id="child-height-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.childHeight}
                </p>
              )}
            </div>

            {/* Current weight */}
            <div>
              <label
                htmlFor="weight"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Current Weight
                {REQUIRED_MARK}
              </label>

              <div className="relative">
                {unit === "cm" ? (
                  <input
                    id="weight"
                    type="number"
                    value={weightKg}
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      clearFieldError("weight");
                    }}
                    placeholder="35"
                    min="10"
                    max="150"
                    step="0.1"
                    required
                    inputMode="decimal"
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.weight)}
                    aria-describedby={
                      fieldErrors.weight ? "weight-error" : undefined
                    }
                    aria-label="Child's current weight in kilograms"
                    className={inputClassName(
                      Boolean(fieldErrors.weight),
                      "pr-12"
                    )}
                  />
                ) : (
                  <input
                    id="weight"
                    type="number"
                    value={weightLb}
                    onChange={(e) => {
                      setWeightLb(e.target.value);
                      clearFieldError("weight");
                    }}
                    placeholder="77"
                    min="22"
                    max="330"
                    step="0.1"
                    required
                    inputMode="decimal"
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.weight)}
                    aria-describedby={
                      fieldErrors.weight ? "weight-error" : undefined
                    }
                    aria-label="Child's current weight in pounds"
                    className={inputClassName(
                      Boolean(fieldErrors.weight),
                      "pr-12"
                    )}
                  />
                )}

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {unit === "cm" ? "kg" : "lb"}
                </span>
              </div>

              {fieldErrors.weight && (
                <p id="weight-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.weight}
                </p>
              )}
            </div>

            {/* Father's height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Father&apos;s Height
                {REQUIRED_MARK}
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={fatherCm}
                    onChange={(e) => {
                      setFatherCm(e.target.value);
                      clearFieldError("fatherHeight");
                    }}
                    placeholder="180"
                    min="100"
                    max="250"
                    step="0.1"
                    required
                    inputMode="decimal"
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.fatherHeight)}
                    aria-describedby={
                      fieldErrors.fatherHeight
                        ? "father-height-error"
                        : undefined
                    }
                    aria-label="Father's height in centimeters"
                    className={inputClassName(
                      Boolean(fieldErrors.fatherHeight),
                      "pr-12"
                    )}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={fatherFeet}
                      onChange={(e) => {
                        setFatherFeet(e.target.value);
                        clearFieldError("fatherHeight");
                      }}
                      placeholder="5"
                      min="0"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.fatherHeight)}
                      aria-label="Father's height feet"
                      className={inputClassName(
                        Boolean(fieldErrors.fatherHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={fatherInches}
                      onChange={(e) => {
                        setFatherInches(e.target.value);
                        clearFieldError("fatherHeight");
                      }}
                      placeholder="11"
                      min="0"
                      max="11"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.fatherHeight)}
                      aria-describedby={
                        fieldErrors.fatherHeight
                          ? "father-height-error"
                          : undefined
                      }
                      aria-label="Father's height inches"
                      className={inputClassName(
                        Boolean(fieldErrors.fatherHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}

              {fieldErrors.fatherHeight && (
                <p
                  id="father-height-error"
                  className="mt-1.5 text-xs text-red-600"
                >
                  {fieldErrors.fatherHeight}
                </p>
              )}
            </div>

            {/* Mother's height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Mother&apos;s Height
                {REQUIRED_MARK}
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={motherCm}
                    onChange={(e) => {
                      setMotherCm(e.target.value);
                      clearFieldError("motherHeight");
                    }}
                    placeholder="165"
                    min="100"
                    max="250"
                    step="0.1"
                    required
                    inputMode="decimal"
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.motherHeight)}
                    aria-describedby={
                      fieldErrors.motherHeight
                        ? "mother-height-error"
                        : undefined
                    }
                    aria-label="Mother's height in centimeters"
                    className={inputClassName(
                      Boolean(fieldErrors.motherHeight),
                      "pr-12"
                    )}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={motherFeet}
                      onChange={(e) => {
                        setMotherFeet(e.target.value);
                        clearFieldError("motherHeight");
                      }}
                      placeholder="5"
                      min="0"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.motherHeight)}
                      aria-label="Mother's height feet"
                      className={inputClassName(
                        Boolean(fieldErrors.motherHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={motherInches}
                      onChange={(e) => {
                        setMotherInches(e.target.value);
                        clearFieldError("motherHeight");
                      }}
                      placeholder="5"
                      min="0"
                      max="11"
                      required
                      inputMode="numeric"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.motherHeight)}
                      aria-describedby={
                        fieldErrors.motherHeight
                          ? "mother-height-error"
                          : undefined
                      }
                      aria-label="Mother's height inches"
                      className={inputClassName(
                        Boolean(fieldErrors.motherHeight),
                        "pr-10"
                      )}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}

              {fieldErrors.motherHeight && (
                <p
                  id="mother-height-error"
                  className="mt-1.5 text-xs text-red-600"
                >
                  {fieldErrors.motherHeight}
                </p>
              )}
            </div>

            {/* Child sex */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Child
                {REQUIRED_MARK}
              </label>

              <select
                id="gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as ChildSex);
                  clearFieldError("gender");
                  setResult(null);
                }}
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.gender)}
                aria-describedby={
                  fieldErrors.gender ? "gender-error" : undefined
                }
                className={inputClassName(Boolean(fieldErrors.gender), "bg-white")}
              >
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>

              {fieldErrors.gender && (
                <p id="gender-error" className="mt-1.5 text-xs text-red-600">
                  {fieldErrors.gender}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={calculateHeight}
              className="w-full cursor-pointer rounded-xl bg-gray-950 px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Calculate Potential Height
            </button>

            {/* Using AAHG (optional) */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-800">
                Using AAHG?
              </p>

              <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setUsingAAHG(false)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                    !usingAAHG
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={() => setUsingAAHG(true)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                    usingAAHG
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Yes
                </button>
              </div>

              <p className="mt-1.5 text-xs text-gray-500">
                AAHG is an oral + daily high-jump routine. Optional — does not
                change the base prediction.
              </p>
            </div>
          </div>

          {/* Result */}
          {result !== null && resultImperial && (
            <div
              aria-live="polite"
              className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center sm:p-6"
            >
              <p className="text-sm font-medium text-gray-500">
                Estimated Adult Height
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
                {result.toFixed(1)} cm
              </p>

              <p className="mt-1 text-lg font-medium text-gray-700">
                {resultImperial.feet} ft {resultImperial.inches} in
              </p>

              {minHeight !== null && maxHeight !== null && (
                <div className="mt-5 rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Estimated Range
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {minHeight.toFixed(1)} – {maxHeight.toFixed(1)} cm
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {cmToFeetInches(minHeight).feet} ft{" "}
                    {cmToFeetInches(minHeight).inches} in –{" "}
                    {cmToFeetInches(maxHeight).feet} ft{" "}
                    {cmToFeetInches(maxHeight).inches} in
                  </p>
                </div>
              )}

              {aahgMin !== null && aahgMax !== null && (
                <div className="mt-5 rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    AAHG Projected Height
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {aahgMin.toFixed(1)}–{aahgMax.toFixed(1)} cm
                  </p>

                  {unit === "ft" && (
                    <p className="mt-1 text-sm text-gray-600">
                      {cmToFeetInches(aahgMin).feet} ft{" "}
                      {cmToFeetInches(aahgMin).inches} in –{" "}
                      {cmToFeetInches(aahgMax).feet} ft{" "}
                      {cmToFeetInches(aahgMax).inches} in
                    </p>
                  )}
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-gray-500">
                This calculator provides an estimate only. Genetics,
                nutrition, health, growth patterns, and other factors can
                influence adult height.
              </p>

              <button
                type="button"
                onClick={resetCalculator}
                className="mt-4 cursor-pointer text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-950"
              >
                Calculate again
              </button>
            </div>
          )}
        </div>

        {/* Formula / explanation */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            How the estimate is calculated
          </h2>

          <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
            <p>
              This tool uses the{" "}
              <strong className="text-gray-900">Khamis-Roche method</strong>,
              which predicts adult height from the child&apos;s age, sex,
              current height, current weight, and mid-parental height — without
              a bone-age X-ray.
            </p>

            <p>
              <strong className="text-gray-900">Formula:</strong> adult height
              = B₀ + b₁·height + b₂·weight + b₃·mid-parent height, using
              age- and sex-specific coefficients (ages {MIN_AGE}–{MAX_AGE}).
            </p>

            <p>
              The result is shown with an approximate ±{rangeCm} cm range for{" "}
              {gender === "boy" ? "boys" : "girls"}. This is not a guarantee of
              final adult height.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
