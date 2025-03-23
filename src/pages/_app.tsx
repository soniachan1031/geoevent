import type { AppProps } from "next/app";
import "@/app/globals.css";
import ToastComponent from "@/components/ToastComponent";
import Layout from "@/components/layouts/Layout";
import AuthProvider from "@/providers/AuthProvider";
import EventSearchProvider from "@/providers/EventSearchProvider";
import { GoogleMapsProvider } from "@/providers/GoogleMapsProvider";
import { useEffect } from "react";


declare global {
  interface Window {
    googleTranslateInit: () => void;
    google: {
      translate: {
        TranslateElement: new (...args: any[]) => void;
      };
    };
  }
}

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const addGoogleTranslate = () => {
      if (!document.getElementById("google-translate")) {
        const script = document.createElement("script");
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateInit";
        script.id = "google-translate";
        document.body.appendChild(script);
      }
    };

    window.googleTranslateInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google-translate"
      );
    };

    addGoogleTranslate();
  }, []);
  return (
    <GoogleMapsProvider>
      <AuthProvider user={pageProps.user}>
        <EventSearchProvider>
          <ToastComponent />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </EventSearchProvider>
      </AuthProvider>
    </GoogleMapsProvider>
  );
}
