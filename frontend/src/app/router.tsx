import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/routing/ProtectedRoute";
import { ConsultationDetailPage } from "../pages/ConsultationDetailPage";
import { ConsultationFormPage } from "../pages/ConsultationFormPage";
import { ConsultationHistoryPage } from "../pages/ConsultationHistoryPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { MyPage } from "../pages/MyPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { StoryDetailPage } from "../pages/StoryDetailPage";
import { StoryListPage } from "../pages/StoryListPage";
import { StoryNewPage } from "../pages/StoryNewPage";

export const routes = {
  home: "/",
  login: "/login",
  consultationNew: "/consultations/new",
  consultationDetail: "/consultations/:consultationId",
  consultationHistory: "/consultations",
  stories: "/stories",
  storyDetail: "/stories/:storyId",
  storyNew: "/stories/new",
  mypage: "/mypage",
} as const;

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routes.login, element: <LoginPage /> },
      {
        path: routes.consultationNew,
        element: (
          <ProtectedRoute>
            <ConsultationFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: routes.consultationDetail,
        element: (
          <ProtectedRoute>
            <ConsultationDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: routes.consultationHistory,
        element: (
          <ProtectedRoute>
            <ConsultationHistoryPage />
          </ProtectedRoute>
        ),
      },
      { path: routes.stories, element: <StoryListPage /> },
      { path: routes.storyDetail, element: <StoryDetailPage /> },
      {
        path: routes.storyNew,
        element: (
          <ProtectedRoute>
            <StoryNewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: routes.mypage,
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
