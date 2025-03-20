import serverSidePropsHandler from "@/lib/server/serverSidePropsHandler";
import { EAuthStatus } from "@/types/user.types";

const PublicApi = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Public API Documentation</h1>

      {/* GET /api/events Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">GET /api/events</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          This endpoint retrieves a combined list of events from your local database along with
          external events fetched from Ticketmaster. The results include both local events (with{" "}
          <code className="bg-gray-100 px-1 rounded">external: false</code>) and external events
          (with <code className="bg-gray-100 px-1 rounded">external: true</code>).
        </p>

        <h3 className="text-xl font-medium mb-2 text-gray-700">Query Parameters</h3>
        <ul className="list-disc ml-5 mb-4 text-gray-700 space-y-1">
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
            <strong>country</strong>: Filter by country (partial match supported).
          </li>
          <li>
            <strong>address</strong>: Filter by address (partial match supported).
          </li>
          <li>
            <strong>dateFrom</strong>: Filter events starting from this date (ISO format).
          </li>
          <li>
            <strong>dateTo</strong>: Filter events up to this date (ISO format).
          </li>
          <li>
            <strong>category</strong>: Filter by event category (e.g. Music, Sports, Arts).
          </li>
          <li>
            <strong>format</strong>: Filter by event format (Online, Offline, Hybrid).
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

        {/* Response Format */}
        <h3 className="text-xl font-medium mb-2 text-gray-700">Response Format</h3>
        <p className="mb-4 text-gray-700">
          The API returns a JSON object with the following structure. Each event conforms to the{" "}
          <code className="bg-gray-100 px-1 rounded">IEvent</code> type:
        </p>
        <pre className="bg-gray-900 text-white p-4 rounded-md text-sm overflow-x-auto">
          {`{
  "status": "success",
  "message": "Events fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "64ffa5...",
        "title": "Local Event Title",
        "location": {
          "city": "Toronto",
          "state": "ON",
          "country": "Canada"
        },
        "date": "2025-06-10T00:00:00.000Z",
        "category": "Music",
        "external": false
      },
      {
        "_id": "G5vzZ9...",
        "title": "External Concert",
        "location": {
          "city": "New York",
          "state": "NY",
          "country": "US"
        },
        "date": "2025-06-12",
        "category": "Other",
        "external": true,
        "url": "https://www.ticketmaster.com/event/..."
      }
    ]
  }
}`}
        </pre>
      </section>

      {/* Example Request */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">Example Request</h2>
        <p className="mb-2 text-gray-700">
          To fetch events with the keyword <code className="bg-gray-100 px-1 rounded">concert</code>{" "}
          in <code className="bg-gray-100 px-1 rounded">Toronto</code> from{" "}
          <code className="bg-gray-100 px-1 rounded">2025-06-01</code> onward, send a request to:
        </p>
        <pre className="bg-gray-900 text-white p-4 rounded-md text-sm overflow-x-auto">
          GET https://geoevent.ca/api/events?search=concert&city=Toronto&dateFrom=2025-06-01&page=1&limit=30
        </pre>
      </section>

      {/* Authentication */}
      <section>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Authentication</h2>
        <p className="text-gray-700">
          This public API route is accessible without authentication.
        </p>
      </section>
    </div>
  );
};

export default PublicApi;

export const getServerSideProps = serverSidePropsHandler({
  access: EAuthStatus.ANY,
});
