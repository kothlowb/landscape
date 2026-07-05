import type { Metadata } from "next";
import BookingFlow from "./booking-flow";

export const metadata: Metadata = {
  title: "Book lawn mowing — Landscape Lawn Co.",
};

export default function BookPage() {
  return (
    <main className="flex-1 px-4 py-12 sm:py-16">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
          Landscape Lawn Co.
        </p>
        <h1 className="mt-3 font-display text-4xl text-pine sm:text-5xl">
          A pristine lawn, booked in a minute
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Enter your address for an instant quote — no site visit needed to get
          started.
        </p>
      </header>
      <BookingFlow />
    </main>
  );
}
