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

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const resultImperial = useMemo(() => {
    if (result === null) return null;
    return cmToFeetInches(result);
  }, [result]);

  const rangeCm = estimatedRangeCm(gender);
  const minHeight = result !== null ? result - rangeCm : null;
  const maxHeight = result !== null ? result + rangeCm : null;

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
    inchesValue: string,
    label: string
  ): { ok: true; cm: number } | { ok: false; message: string } {
    if (feetValue === "" || inchesValue === "") {
      return { ok: false, message: `Please enter ${label}.` };
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
    setError("");
    setResult(null);

    if (!age) {
      setError("Please enter the child's current age.");
      return;
    }

    const ageYears = Number(age);
    if (!Number.isFinite(ageYears)) {
      setError("Please enter a valid age.");
      return;
    }

    if (ageYears < MIN_AGE || ageYears > MAX_AGE) {
      setError(
        `Khamis-Roche estimates require an age between ${MIN_AGE} and ${MAX_AGE} years.`
      );
      return;
    }

    let childHeightCm: number;
    let childWeightKg: number;
    let fatherHeightCm: number;
    let motherHeightCm: number;

    if (unit === "cm") {
      if (!childCm) {
        setError("Please enter the child's current height.");
        return;
      }
      if (!weightKg) {
        setError("Please enter the child's current weight.");
        return;
      }
      if (!fatherCm || !motherCm) {
        setError("Please enter both parents' heights.");
        return;
      }

      childHeightCm = Number(childCm);
      childWeightKg = Number(weightKg);
      fatherHeightCm = Number(fatherCm);
      motherHeightCm = Number(motherCm);
    } else {
      const childHeight = parseHeightPair(
        childFeet,
        childInches,
        "the child's current height"
      );
      if (!childHeight.ok) {
        setError(childHeight.message);
        return;
      }

      if (!weightLb) {
        setError("Please enter the child's current weight.");
        return;
      }

      const weight = Number(weightLb);
      if (!Number.isFinite(weight)) {
        setError("Please enter valid numbers.");
        return;
      }

      const fatherHeight = parseHeightPair(
        fatherFeet,
        fatherInches,
        "both parents' heights"
      );
      if (!fatherHeight.ok) {
        setError(fatherHeight.message);
        return;
      }

      const motherHeight = parseHeightPair(
        motherFeet,
        motherInches,
        "both parents' heights"
      );
      if (!motherHeight.ok) {
        setError(motherHeight.message);
        return;
      }

      childHeightCm = childHeight.cm;
      childWeightKg = lbToKg(weight);
      fatherHeightCm = fatherHeight.cm;
      motherHeightCm = motherHeight.cm;
    }

    if (!isValidChildHeight(childHeightCm)) {
      setError("Please enter a realistic child height between 80 cm and 220 cm.");
      return;
    }

    if (!isValidWeightKg(childWeightKg)) {
      setError("Please enter a realistic child weight between 10 kg and 150 kg.");
      return;
    }

    if (
      !isValidParentHeight(fatherHeightCm) ||
      !isValidParentHeight(motherHeightCm)
    ) {
      setError(
        "Please enter realistic parent heights between 100 cm and 250 cm."
      );
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
    setResult(null);
    setError("");
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
    setError("");
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
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
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
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  unit === "ft"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                ft / lb
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Current age */}
            <div>
              <label
                htmlFor="age"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Current Age
              </label>

              <div className="relative">
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="10"
                  min={MIN_AGE}
                  max={MAX_AGE}
                  step="0.1"
                  inputMode="decimal"
                  aria-label="Child's current age in years"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  years
                </span>
              </div>

              <p className="mt-1.5 text-xs text-gray-500">
                Ages {MIN_AGE}–{MAX_AGE} years are supported.
              </p>
            </div>

            {/* Current height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Current Height
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={childCm}
                    onChange={(e) => setChildCm(e.target.value)}
                    placeholder="140"
                    min="80"
                    max="220"
                    step="0.1"
                    inputMode="decimal"
                    aria-label="Child's current height in centimeters"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
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
                      onChange={(e) => setChildFeet(e.target.value)}
                      placeholder="4"
                      min="0"
                      inputMode="numeric"
                      aria-label="Child's height feet"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={childInches}
                      onChange={(e) => setChildInches(e.target.value)}
                      placeholder="7"
                      min="0"
                      max="11"
                      inputMode="numeric"
                      aria-label="Child's height inches"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Current weight */}
            <div>
              <label
                htmlFor="weight"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Current Weight
              </label>

              <div className="relative">
                {unit === "cm" ? (
                  <input
                    id="weight"
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="35"
                    min="10"
                    max="150"
                    step="0.1"
                    inputMode="decimal"
                    aria-label="Child's current weight in kilograms"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />
                ) : (
                  <input
                    id="weight"
                    type="number"
                    value={weightLb}
                    onChange={(e) => setWeightLb(e.target.value)}
                    placeholder="77"
                    min="22"
                    max="330"
                    step="0.1"
                    inputMode="decimal"
                    aria-label="Child's current weight in pounds"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />
                )}

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {unit === "cm" ? "kg" : "lb"}
                </span>
              </div>
            </div>

            {/* Father's height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Father&apos;s Height
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={fatherCm}
                    onChange={(e) => setFatherCm(e.target.value)}
                    placeholder="180"
                    min="100"
                    max="250"
                    step="0.1"
                    inputMode="decimal"
                    aria-label="Father's height in centimeters"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
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
                      onChange={(e) => setFatherFeet(e.target.value)}
                      placeholder="5"
                      min="0"
                      inputMode="numeric"
                      aria-label="Father's height feet"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={fatherInches}
                      onChange={(e) => setFatherInches(e.target.value)}
                      placeholder="11"
                      min="0"
                      max="11"
                      inputMode="numeric"
                      aria-label="Father's height inches"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mother's height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Mother&apos;s Height
              </label>

              {unit === "cm" ? (
                <div className="relative">
                  <input
                    type="number"
                    value={motherCm}
                    onChange={(e) => setMotherCm(e.target.value)}
                    placeholder="165"
                    min="100"
                    max="250"
                    step="0.1"
                    inputMode="decimal"
                    aria-label="Mother's height in centimeters"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
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
                      onChange={(e) => setMotherFeet(e.target.value)}
                      placeholder="5"
                      min="0"
                      inputMode="numeric"
                      aria-label="Mother's height feet"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ft
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={motherInches}
                      onChange={(e) => setMotherInches(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="11"
                      inputMode="numeric"
                      aria-label="Mother's height inches"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Child sex */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Child
              </label>

              <select
                id="gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as ChildSex);
                  setResult(null);
                  setError("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={calculateHeight}
              className="w-full rounded-xl bg-gray-950 px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Calculate Potential Height
            </button>
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

              <p className="mt-4 text-xs leading-5 text-gray-500">
                This calculator provides an estimate only. Genetics,
                nutrition, health, growth patterns, and other factors can
                influence adult height.
              </p>

              <button
                type="button"
                onClick={resetCalculator}
                className="mt-4 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-950"
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
