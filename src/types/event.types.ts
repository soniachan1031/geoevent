import { TLocation } from "./location.types";
import { IUser } from "./user.types";

export enum EEventCategory {
  MUSIC = "Music",
  SPORTS = "Sports",
  ARTS = "Arts",
  SCIENCE = "Science",
  FOOD_DRINK = "Food & Drink",
  CHARITY = "Charity",
  SCIENCE_TECH = "Science & Tech",
  COMMUNITY = "Community",
  FASHION = "Fashion",
  GOVERNMENT = "Government",
  FITNESS = "Fitness",
  HOLIDAYS = "Holidays",
  ANY = "any",
}

export enum EEventFormat {
  ONLINE = "Online",
  OFFLINE = "Offline",
  HYBRID = "Hybrid",
}

export enum EEventLanguage {
  ENGLISH = "English",
  SPANISH = "Spanish",
  FRENCH = "French",
  GERMAN = "German",
  ITALIAN = "Italian",
  DUTCH = "Dutch",
  PORTUGESE = "Portugese",
  SWEDISH = "Swedish",
  HINDI = "Hindi",
}

export type TEventAgenda = {
  time: string;
  activity: string;
};

export type TEventContact = {
  email: string;
  phone: number;
};

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  location: TLocation;
  date: Date | string;
  time: string;
  duration?: number; // in minutes
  category: EEventCategory;
  format: EEventFormat;
  language: EEventLanguage;
  capacity?: number;
  registrationDeadline?: Date | string;
  image?: string;
  agenda?: TEventAgenda[];
  contact: TEventContact;
  organizer: string | IUser;
  external?: boolean;
  url?: string;
}

export interface ISavedEvent {
  _id: string;
  user: string | IUser;
  event: string | IEvent;
  date: Date;
}

export interface IEventRegistration {
  _id: string;
  user: string | IUser;
  event: string | IEvent;
  date: Date;
}

export interface IEventFeedback {
  _id: string;
  user: string | IUser;
  event: string | IEvent;
  date: Date;
  rating: number;
  review: string;
}

export interface IEventViews {
  _id: string;
  event: string | IEvent;
  views: number;
}

export enum EEventShareMedia {
  WHATSAPP = "WhatsApp",
  FACEBOOK = "Facebook",
  TWITTER = "Twitter",
  LINKEDIN = "LinkedIn",
  URL = "URL",
}

export interface IEventShare {
  _id: string;
  user?: string | IUser;
  event: string | IEvent;
  media: EEventShareMedia;
  date: Date;
}
