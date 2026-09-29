"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";

export type FinderMake = { id: string; name: string; slug: string };
export type FinderModel = {
  id: string;
  name: string;
  brandId: string;
  yearStart: number;
  yearEnd: number;
};

export function BikeFinder({ makes, models: allModels }: { makes: FinderMake[]; models: FinderModel[] }) {
  const router = useRouter();
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState("");
  const models = allModels.filter((item) => item.brandId === makeId);
  const model = models.find((item) => item.id === modelId);
  const lastYear = model?.yearEnd ?? new Date().getFullYear();
  const years = model
    ? Array.from(
        { length: Math.max(0, lastYear - (model.yearStart ?? lastYear) + 1) },
        (_, i) => lastYear - i,
      )
    : [];

  function findParts(event: FormEvent) {
    event.preventDefault();
    const make = makes.find((item) => item.id === makeId);
    if (!make || !model) return;
    const params = new URLSearchParams({ brand: make.slug, model: model.id });
    if (year) params.set("year", year);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <section className="mrk-finder" id="bike-finder" aria-labelledby="finder-title">
      <form onSubmit={findParts} className="mrk-container mrk-finder-form">
        <h2 id="finder-title">
          Find parts{" "}
          <br />
          for your bike <span />
        </h2>
        <label htmlFor="bike-make">
          Make
          <span className="mrk-select-wrap">
            <select
              id="bike-make"
              required
              value={makeId}
              onChange={(e) => {
                setMakeId(e.target.value);
                setModelId("");
                setYear("");
              }}
            >
              <option value="">Select make</option>
              {makes.map((make) => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))}
            </select>
            <ChevronDown />
          </span>
        </label>
        <label htmlFor="bike-model">
          Model
          <span className="mrk-select-wrap">
            <select
              id="bike-model"
              required
              value={modelId}
              disabled={!makeId}
              onChange={(e) => {
                setModelId(e.target.value);
                setYear("");
              }}
            >
              <option value="">
                {makeId && !models.length ? "No models available" : "Select model"}
              </option>
              {models.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.yearStart ? ` (${item.yearStart}–${item.yearEnd ?? "present"})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown />
          </span>
        </label>
        <label htmlFor="bike-year">
          Year
          <span className="mrk-select-wrap">
            <select
              id="bike-year"
              value={year}
              disabled={!modelId}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown />
          </span>
        </label>
        <button type="submit" className="mrk-button mrk-button-light">
          Find parts <ArrowRight />
        </button>
        {makeId && !models.length && (
          <p className="mrk-finder-message" role="status">
            No models are listed for this make yet. Choose another make or browse all parts.
          </p>
        )}
      </form>
    </section>
  );
}
