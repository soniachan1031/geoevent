import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="logo-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="logo-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="logo-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>
      <body className="bg-background text-foreground antialiased relative min-h-screen selection:bg-primary/20">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
