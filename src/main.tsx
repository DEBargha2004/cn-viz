import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import RootLayout from "./routes/root";
import ChapterIndex from "./routes/chapter-index";
import ChapterPage, { chapterLoader } from "./routes/chapter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <ChapterIndex /> },
      {
        path: "chapters/:chapterSlug",
        element: <ChapterPage />,
        loader: chapterLoader,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
