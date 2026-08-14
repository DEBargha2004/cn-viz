import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import RootLayout from "./routes/root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await import("./routes/chapter-index");
          return { Component };
        },
      },
      {
        path: "chapters/:chapterSlug",
        lazy: async () => {
          const { default: Component, chapterLoader } = await import("./routes/chapter");
          return { Component, loader: chapterLoader };
        },
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
