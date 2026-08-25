import { createBrowserRouter } from "react-router-dom";
import MainPage from "./routes/main/MainPage";
import MemorialCard from "./routes/memorialCard/MemorialCard";
import GuestbookForm from "./routes/guestBookForm/GuestBookForm";
import Altar from "./routes/altar/Altar";
import NextPage from "./routes/next/NextPage";
import Login from "./routes/account/Login";
import Request from "./routes/request/Request";

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
  {
    path: "/altar/:key",
    element: <Altar />
  },
  {
    path: "/next/:key",
    element: <NextPage />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/request",
    element: <Request />
  },
]);

export default router;
