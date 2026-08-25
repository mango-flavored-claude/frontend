import { createBrowserRouter } from "react-router-dom";
import MainPage from "./routes/main/MainPage";
import MemorialCard from "./routes/memorialCard/MemorialCard";
import GuestbookForm from "./routes/guestBookForm/GuestBookForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/intro/:key",
    element: <MemorialCard />
  },
  {
    path: "/guestBookForm/:key",
    element: <GuestbookForm />
  },
]);

export default router;
