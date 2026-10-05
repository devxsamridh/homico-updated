import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { VendorProvider } from "@/lib/vendor-context";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Homico — Plan, Design & Build Your Dream Home" },
      { name: "description", content: "Plan, design, and build your home end-to-end with architects, materials, and turnkey construction services." },
      { property: "og:title", content: "Homico — Plan, Design & Build Your Dream Home" },
      { property: "og:description", content: "Plan, design, and build your home end-to-end with architects, materials, and turnkey construction services." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Homico — Plan, Design & Build Your Dream Home" },
      { name: "twitter:description", content: "Plan, design, and build your home end-to-end with architects, materials, and turnkey construction services." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1d3d52c6-de42-479b-9136-23ef3eebb093/id-preview-80c3598a--2dd961ef-3a13-4fe8-836e-5357b49d84b0.lovable.app-1780901212439.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1d3d52c6-de42-479b-9136-23ef3eebb093/id-preview-80c3598a--2dd961ef-3a13-4fe8-836e-5357b49d84b0.lovable.app-1780901212439.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Homico",
          url: "https://homico.lovable.app",
          description: "Plan, design and build your home end-to-end — architects, raw materials, home services, and turnkey construction.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Homico",
          url: "https://homico.lovable.app",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VendorProvider>
          <Outlet />
          <Toaster position="top-right" richColors duration={800} />
        </VendorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
