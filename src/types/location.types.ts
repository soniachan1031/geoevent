export type TLocation = {
  _id?: string;
  id?: string;
  address: string;
  city?: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
};

export type TSearchLocation = {
  city?: string;
  state?: string;
  country: string;
};
