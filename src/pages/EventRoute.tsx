import { EventPage } from "@/components/events/EventPage";

const EventRoute = () => {
  return (
    <main className="min-h-screen">
      <div className="container max-w-3xl py-6 sm:py-12">
        <EventPage />
      </div>
    </main>
  );
};

export default EventRoute;
