"use client";

import { useCallback, useMemo, useState } from "react";
import { currency } from "@/lib/format";
import type { BookingSummary } from "@/lib/services/booking";
import { isMapsConfigured, type SelectedPlace } from "@/lib/services/google-maps";
import {
  getQuoteForAddress,
  submitBooking,
  type QuotePayload,
} from "./actions";
import AddressInput from "./address-input";
import PropertyMap from "./property-map";

interface DateOption {
  iso: string;
  weekday: string;
  day: number;
  month: string;
}

function nextAvailableDates(count = 14): DateOption[] {
  const today = new Date();
  const options: DateOption[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const pad = (n: number) => String(n).padStart(2, "0");
    options.push({
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return options;
}

function SectionHeading({ step, title }: { step: number; title: string }) {
  return (
    <h2 className="flex items-baseline gap-3 font-display text-xl text-pine">
      <span className="text-sm font-semibold tracking-widest text-gold">
        {String(step).padStart(2, "0")}
      </span>
      {title}
    </h2>
  );
}

export default function BookingFlow() {
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [quote, setQuote] = useState<QuotePayload | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingSummary | null>(null);

  const dates = useMemo(() => nextAvailableDates(), []);

  const handleSelectPlace = useCallback((selected: SelectedPlace) => {
    setPlace(selected);
    setQuote(null);
    setError(null);
    setQuoteLoading(true);
    getQuoteForAddress(selected.address).then((result) => {
      setQuoteLoading(false);
      if (result.ok) setQuote(result.quote);
      else setError(result.error);
    });
  }, []);

  async function handleConfirm() {
    if (!place || !quote || !scheduledDate) return;
    setSubmitting(true);
    setError(null);
    const result = await submitBooking({
      name,
      email,
      phone,
      address: quote.address,
      latitude: place.lat,
      longitude: place.lng,
      scheduledDate,
    });
    setSubmitting(false);
    if (result.ok) setConfirmation(result.booking);
    else setError(result.error);
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-mist bg-card p-8 shadow-sm">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-fern/15 text-2xl">
          ✓
        </div>
        <h2 className="font-display text-3xl text-pine">You&apos;re booked!</h2>
        <p className="mt-2 text-ink-soft">
          We&apos;ve received your request — our crew will confirm shortly.
        </p>
        <dl className="mt-6 space-y-3 border-t border-mist pt-6 text-sm">
          {[
            ["Service", confirmation.serviceName],
            ["Address", confirmation.address],
            ["Date", confirmation.scheduledDate],
            ["Estimated turf", `${confirmation.turfSqft.toLocaleString()} sq ft`],
            ["Quoted price", currency.format(confirmation.quotedPrice)],
            ["Name", confirmation.customerName],
            ["Email", confirmation.customerEmail],
            ["Booking ref", confirmation.jobId.slice(0, 8).toUpperCase()],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="text-right font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full rounded-xl border border-pine px-5 py-3 font-medium text-pine transition hover:bg-pine hover:text-canvas"
        >
          Book another property
        </button>
      </div>
    );
  }

  const readyToConfirm =
    Boolean(place && quote && scheduledDate && name.trim() && email.trim()) &&
    !submitting;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {/* Step 1 — address */}
      <section className="space-y-4">
        <SectionHeading step={1} title="Where's the lawn?" />
        <AddressInput onSelect={handleSelectPlace} />
        {place && isMapsConfigured() && place.lat !== 0 && (
          <PropertyMap lat={place.lat} lng={place.lng} />
        )}
      </section>

      {/* Step 2 — quote */}
      {(quoteLoading || quote) && (
        <section className="space-y-4">
          <SectionHeading step={2} title="Your instant quote" />
          {quoteLoading && (
            <div className="rounded-2xl border border-mist bg-card p-6 text-ink-soft">
              Measuring your lawn…
            </div>
          )}
          {quote && (
            <div className="rounded-2xl border border-mist bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-ink-soft">
                    {quote.serviceName}
                  </p>
                  <p className="mt-1 font-display text-5xl text-pine">
                    {currency.format(quote.price)}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">per visit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-soft">Estimated turf area</p>
                  <p className="font-display text-2xl text-fern">
                    {quote.turfSqft.toLocaleString()} sq ft
                  </p>
                </div>
              </div>
              <p className="mt-4 border-t border-mist pt-4 text-sm text-ink-soft">
                Estimate based on property records — final price confirmed
                on-site if needed.
              </p>
              {quote.usingFallbackPricing && (
                <p className="mt-2 rounded-lg bg-sun/20 px-3 py-2 text-sm text-ink">
                  Dev mode: using default pricing (Supabase not configured yet).
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step 3 — date */}
      {quote && (
        <section className="space-y-4">
          <SectionHeading step={3} title="Pick a day" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {dates.map((d) => {
              const selected = d.iso === scheduledDate;
              return (
                <button
                  key={d.iso}
                  onClick={() => setScheduledDate(d.iso)}
                  className={`rounded-xl border px-2 py-3 text-center transition ${
                    selected
                      ? "border-pine bg-pine text-canvas shadow-sm"
                      : "border-mist bg-card text-ink hover:border-fern"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-wide opacity-70">
                    {d.weekday}
                  </span>
                  <span className="block font-display text-lg">{d.day}</span>
                  <span className="block text-xs opacity-70">{d.month}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 4 — contact + confirm */}
      {quote && scheduledDate && (
        <section className="space-y-4">
          <SectionHeading step={4} title="Your details" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-xl border border-mist bg-white px-4 py-3 placeholder:text-ink-soft/60 focus:border-fern focus:outline-none sm:col-span-2"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-xl border border-mist bg-white px-4 py-3 placeholder:text-ink-soft/60 focus:border-fern focus:outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="rounded-xl border border-mist bg-white px-4 py-3 placeholder:text-ink-soft/60 focus:border-fern focus:outline-none"
            />
          </div>
          <button
            onClick={handleConfirm}
            disabled={!readyToConfirm}
            className="w-full rounded-xl bg-gold px-5 py-4 font-medium text-pine-deep shadow-sm transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Booking…"
              : `Confirm booking — ${currency.format(quote.price)}`}
          </button>
        </section>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
