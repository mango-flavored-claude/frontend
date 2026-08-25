import { createBrowserRouter } from "react-router-dom";
import MainPage from "./routes/main/MainPage";
import MemorialCard from "./routes/memorialCard/MemorialCard";
import GuestbookForm from "./routes/guestBookForm/GuestBookForm";
import Altar from "./routes/altar/Altar";
import NextPage from "./routes/next/NextPage";
import Login from "./routes/account/Login";
import SignUp from "./routes/account/SignUp";
import Request from "./routes/request/Request";
import ReEnter from "./routes/reEnter/ReEnter";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    // :key가 없으면(예: /intro) useInviteToken()이 .env의 더미 토큰으로 대체함
    path: "/intro/:key?",
    element: <MemorialCard />
  },
  {
    path: "/reenter/:key?",
    element: <ReEnter />
  },
  {
    path: "/guestBookForm/:key?",
    element: <GuestbookForm />
  },
  {
    path: "/altar/:key?",
    element: <Altar />
  },
  {
    path: "/next/:key?",
    element: <NextPage />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "/request",
    element: <Request />
  },
],
{
    basename: "/frontend",
  }
);

export default router;
