import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="logo.png" />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>
      <body className="bg-slate-100 relative min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
