"use client";

import { useMemo, useState } from "react";

type Gender = "boy" | "girl";
type Unit = "cm" | "ft";

const HEIGHT_ADJUSTMENT_CM = 13;
const ESTIMATED_RANGE_CM = 8;

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

export default function ChildHeightCalculatorPage() {
  const [unit, setUnit] = useState<Unit>("cm");
  const [gender, setGender] = useState<Gender>("boy");

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

  const minHeight = result !== null ? result - ESTIMATED_RANGE_CM : null;
  const maxHeight = result !== null ? result + ESTIMATED_RANGE_CM : null;

  function isValidParentHeight(cm: number) {
    return Number.isFinite(cm) && cm >= 100 && cm <= 250;
  }

  function calculateHeight() {
    setError("");
    setResult(null);

    let fatherHeightCm: number;
    let motherHeightCm: number;

    if (unit === "cm") {
      if (!fatherCm || !motherCm) {
        setError("Please enter both parents' heights.");
        return;
      }

      fatherHeightCm = Number(fatherCm);
      motherHeightCm = Number(motherCm);
    } else {
      if (
        fatherFeet === "" ||
        fatherInches === "" ||
        motherFeet === "" ||
        motherInches === ""
      ) {
        setError("Please enter both parents' heights.");
        return;
      }

      const fatherFt = Number(fatherFeet);
      const fatherIn = Number(fatherInches);
      const motherFt = Number(motherFeet);
      const motherIn = Number(motherInches);

      if (
        !Number.isFinite(fatherFt) ||
        !Number.isFinite(fatherIn) ||
        !Number.isFinite(motherFt) ||
        !Number.isFinite(motherIn)
      ) {
        setError("Please enter valid numbers.");
        return;
      }

      if (
        fatherFt < 0 ||
        motherFt < 0 ||
        fatherIn < 0 ||
        fatherIn >= 12 ||
        motherIn < 0 ||
        motherIn >= 12
      ) {
        setError("Inches must be between 0 and 11.");
        return;
      }

      fatherHeightCm = feetInchesToCm(fatherFt, fatherIn);
      motherHeightCm = feetInchesToCm(motherFt, motherIn);
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

    // Mid-parental height estimate:
    //
    // Boy:
    // (Father height + Mother height + 13 cm) / 2
    //
    // Girl:
    // (Father height + Mother height - 13 cm) / 2

    const estimatedHeight =
      gender === "boy"
        ? (fatherHeightCm + motherHeightCm + HEIGHT_ADJUSTMENT_CM) / 2
        : (fatherHeightCm + motherHeightCm - HEIGHT_ADJUSTMENT_CM) / 2;

    setResult(estimatedHeight);
  }

  function resetCalculator() {
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
              Estimate a child&apos;s potential adult height using the
              parents&apos; heights.
            </p>
          </header>

          {/* Unit selector */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Height unit
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
                Centimeters
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
                Feet / Inches
              </button>
            </div>
          </div>

          <div className="space-y-5">
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
                  setGender(e.target.value as Gender);
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
              <strong className="text-gray-900">Boy:</strong>{" "}
              (Father&apos;s height + Mother&apos;s height + 13 cm) ÷ 2
            </p>

            <p>
              <strong className="text-gray-900">Girl:</strong>{" "}
              (Father&apos;s height + Mother&apos;s height − 13 cm) ÷ 2
            </p>

            <p>
              The result is shown with an approximate ±8 cm range. This is
              not a guarantee of final adult height.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}