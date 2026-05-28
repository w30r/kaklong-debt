import { getChronologyEvents } from "../actions";
import { ChronologyTimeline } from "./chronology-timeline";
import { ChronologyForm } from "./chronology-form";
import { ChronologyExport } from "./chronology-export";

export default async function ChronologyPage() {
  const events = await getChronologyEvents();

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 pl-10 sm:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Chronology
          </h1>
        </div>

        <div className="flex justify-end gap-2 mb-4 sm:mb-6">
          <ChronologyExport events={events} />
          <ChronologyForm />
        </div>

        <ChronologyTimeline events={events} />
      </div>
    </div>
  );
}
