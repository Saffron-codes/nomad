import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StoryPage } from "./pages/StoryPage";
import { useTimerEngine } from "./hooks/useTimerEngine";
import { UpdatePrompt } from "./components/UpdatePrompt";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/story", element: <StoryPage /> },
  { path: "/settings", element: <SettingsPage /> },
]);

/** Keeps the timer, notifications, and tray alive across page changes. */
function TimerEngine() {
  useTimerEngine();
  return null;
}

function App() {
  return (
    <>
      <TimerEngine />
      <RouterProvider router={router} />
      <UpdatePrompt />
    </>
  );
}

export default App;
