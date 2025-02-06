import type { AppProps } from "next/app";
import "@/styles/globals.css";
import ToastComponent from "@/components/ToastComponent";
import Layout from "@/components/layouts/Layout";
import AuthProvider from "@/providers/AuthProvider";
import EventSearchProvider from "@/providers/EventSearchProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider user={pageProps.user}>
      <EventSearchProvider>
        <ToastComponent />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </EventSearchProvider>
    </AuthProvider>
  );
}
