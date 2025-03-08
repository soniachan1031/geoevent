import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

const PublicApi = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Public API Documentation</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">GET /api/events</h2>
        <p className="mb-4">
          This endpoint retrieves a combined list of events from your local
          database along with external events fetched from external APIs. The
          results include both local events (with <code>external: false</code>)
          and external events (with <code>external: true</code>). It accepts
          various query parameters to filter events by keyword, location, date,
          and event attributes.
        </p>

        <h3 className="text-xl font-semibold mb-2">Query Parameters</h3>
        <ul className="list-disc ml-5 mb-4">
          <li>
            <strong>search</strong>: Search term to match event title or ID.
          </li>
          <li>
            <strong>city</strong>: Filter by city (partial match supported).
          </li>
          <li>
            <strong>state</strong>: Filter by state (partial match supported).
          </li>
          <li>
            <strong>country</strong>: Filter by country (partial match
            supported).
          </li>
          <li>
            <strong>address</strong>: Filter by address (partial match
            supported).
          </li>
          <li>
            <strong>dateFrom</strong>: Filter events starting from this date
            (ISO format recommended).
          </li>
          <li>
            <strong>dateTo</strong>: Filter events up to this date (ISO format
            recommended).
          </li>
          <li>
            <strong>category</strong>: Filter by event category (e.g. Music,
            Sports, Arts, etc.).
          </li>
          <li>
            <strong>format</strong>: Filter by event format (Online, Offline,
            Hybrid).
          </li>
          <li>
            <strong>language</strong>: Filter by event language.
          </li>
          <li>
            <strong>page</strong>: The page number (default: 1).
          </li>
          <li>
            <strong>limit</strong>: Number of events per page (default: 30).
          </li>
        </ul>

        <h3 className="text-xl font-semibold mb-2">Response Format</h3>
        <p className="mb-4">
          The API returns a JSON object with the following structure. Each event
          conforms to the <code>IEvent</code> type:
        </p>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm mb-4">
          {`{
  "status": "success",
  "message": "Events fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "64ffa5...",
        "title": "Local Event Title",
        "description": "Event description...",
        "location": {
          "city": "Toronto",
          "state": "ON",
          "country": "Canada",
          "address": "123 Main St",
          "lat": 43.65107,
          "lng": -79.347015
        },
        "date": "2025-06-10T00:00:00.000Z",
        "time": "18:00",
        "duration": 120,
        "category": "Music",
        "format": "Offline",
        "language": "English",
        "capacity": 200,
        "registrationDeadline": "2025-06-01T00:00:00.000Z",
        "image": "https://example.com/image.jpg",
        "agenda": [
          { "time": "18:00", "activity": "Welcome Speech" },
          { "time": "18:30", "activity": "Live Performance" }
        ],
        "contact": { "email": "info@example.com", "phone": 1234567890 },
        "organizer": { "_id": "64ab...", "name": "Organizer Name" },
        "external": false,
        "url": null
      },
      {
        "_id": "G5vzZ9...",
        "title": "External Concert",
        "description": "External event description...",
        "location": {
          "city": "New York",
          "state": "NY",
          "country": "US",
          "address": "Madison Square Garden",
          "lat": 40.7505,
          "lng": -73.9934
        },
        "date": "2025-06-12",
        "time": "20:00",
        "duration": null,
        "category": "Other",
        "format": "Offline",
        "language": "English",
        "capacity": null,
        "registrationDeadline": null,
        "image": "https://example.com/external-image.jpg",
        "agenda": [],
        "contact": { "email": "", "phone": 0 },
        "organizer": "Ticketmaster",
        "external": true,
        "url": "https://www.ticketmaster.com/event/..."
      }
      // ...more events
    ],
    "pagination": {
      "total": 270057,
      "pages": 9002,
      "page": 1,
      "limit": 30
    }
  }
}`}
        </pre>
        <p className="mb-4">
          In the response, <code>docs</code> is an array of events. Each event
          is an <code>IEvent</code> with an <code>external</code> property
          indicating its origin (false for local events, true for external
          events).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Example Request</h2>
        <p className="mb-2">
          To fetch events with the keyword <code>concert</code> in{" "}
          <code>Toronto</code> from <code>2025-06-01</code> onward:
        </p>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm mb-4">
          {`GET /api/events?search=concert&city=Toronto&dateFrom=2025-06-01&page=1&limit=30`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Authentication</h2>
        <p>This public API route is accessible without authentication.</p>
      </section>
    </div>
  );
};

export default PublicApi;

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});
