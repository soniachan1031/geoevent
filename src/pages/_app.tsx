import type { AppProps } from "next/app";
import "@/styles/globals.css";
import ToastComponent from "@/components/ToastComponent";
import Layout from "@/components/layouts/Layout";
import AuthProvider from "@/providers/AuthProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider user={pageProps.user}>
      <ToastComponent />
      <Layout user={pageProps.user}>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
