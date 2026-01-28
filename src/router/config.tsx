
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import ForgotPassword from "../pages/auth/forgot-password";
import ResetPassword from "../pages/auth/reset-password";
import Dashboard from "../pages/dashboard/page";
import PatientProfile from "../pages/patient/[id]";
import Checklist from "../pages/checklist/page";
import References from "../pages/references/page";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/home",
    element: <ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>,
  },
  {
    path: "/patient/:id",
    element: <ProtectedRoute><MainLayout><PatientProfile /></MainLayout></ProtectedRoute>,
  },
  {
    path: "/checklist",
    element: <ProtectedRoute><MainLayout><Checklist /></MainLayout></ProtectedRoute>,
  },
  {
    path: "/references",
    element: <ProtectedRoute><MainLayout><References /></MainLayout></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;

