import {
  EEventCategory,
  EEventFormat,
  EEventLanguage,
  IEvent,
} from "@/types/event.types";

export default function ticketMasterToLocalEvent(ev: any) {
  const cityName = ev._embedded?.venues?.[0]?.city?.name ?? "";
  const stateName = ev._embedded?.venues?.[0]?.state?.name ?? "";
  const countryName = ev._embedded?.venues?.[0]?.country?.name ?? "";
  const addressLine = ev._embedded?.venues?.[0]?.address?.line1 ?? "";
  return {
    _id: ev.id,
    title: ev.name,
    description: ev.info ?? "",
    location: {
      city: cityName,
      state: stateName,
      country: countryName,
      address: addressLine,
      lat: Number(ev._embedded?.venues?.[0]?.location?.latitude ?? 0),
      lng: Number(ev._embedded?.venues?.[0]?.location?.longitude ?? 0),
    },

    date: ev.dates?.start?.localDate ?? "",
    time: ev.dates?.start?.localTime ?? "00:00",
    duration: undefined,
    category: ev.classifications?.[0]?.segment?.name ?? EEventCategory.OTHER, // or parse from ev.classifications
    format: EEventFormat.OFFLINE,
    language: EEventLanguage.ENGLISH,
    capacity: undefined,
    registrationDeadline: undefined,
    image: ev.images?.[0]?.url,
    agenda: [],
    contact: { email: "", phone: 0 },
    organizer: ev.promoter?.name ?? "TicketMaster",
    external: true,
    url: ev.url,
  } as IEvent;
}
