import { createBrowserRouter } from "react-router-dom";
import MainPage from "./routes/main/MainPage";
import MemorialCard from "./routes/memorialCard/MemorialCard";
import GuestbookForm from "./routes/guestBookForm/GuestBookForm";
import Altar from "./routes/altar/Altar";
import NextPage from "./routes/next/NextPage";
import Login from "./routes/login/Login";
import ReEnter from "./routes/reEnter/ReEnter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/intro/:key",
    element: <MemorialCard />
  },
  {
    path: "/reenter/:key",
    element: <ReEnter />
  },
  {
    path: "/guestBookForm/:key",
    element: <GuestbookForm />
  },
  {
    path: "/altar/:key",
    element: <Altar />
  },
  {
    path: "/next/:key",
    element: <NextPage />
  },
]);

export default router;
