import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { GlobalToastContainer } from './components/common/GlobalToastContainer'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import {
  AllProfilesPage,
  DailyRecommendationsPage,
  ProfileVisitorsPage,
  InterestReceivedPage,
  InterestSentPage,
  UnlockedProfilesPage,
  IDeclinedPage,
  TheyDeclinedPage,
  ShortlistedProfilesPage,
  IgnoredProfilesPage,
  BlockedProfilesPage,
  JustJoinedPage,
} from './pages/ProfileListsPage'
import { PolicyPage } from './pages/PolicyPage'
import { RegisterPage } from './pages/RegisterPage'
import { MembershipPage } from './pages/MembershipPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { DeleteProfilePage } from './pages/DeleteProfilePage'
import { FeedbackPage } from './pages/FeedbackPage'
import { HelpCenterPage } from './pages/HelpCenterPage'
import { ProfileViewPage } from './pages/ProfileViewPage'
import { SearchPage } from './pages/SearchPage'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { TermsConditionsPage } from './pages/TermsConditionsPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { VerificationPendingPage } from './pages/VerificationPendingPage'
import { NotificationPage } from './pages/NotificationPage'
import { MyProfilePage } from './pages/MyProfilePage'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <>
      <GlobalToastContainer />
      <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="under-verification" element={<VerificationPendingPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/notification" element={<NotificationPage />} />
          <Route path="dashboard/search" element={<SearchPage />} />
          <Route path="dashboard/search/results" element={<SearchResultsPage />} />
          <Route path="dashboard/profiles" element={<AllProfilesPage />} />
          <Route path="dashboard/recommendations" element={<DailyRecommendationsPage />} />
          <Route path="dashboard/visitors" element={<ProfileVisitorsPage />} />
          <Route path="dashboard/justjoined" element={<JustJoinedPage />} />
          <Route path="dashboard/interestreceived" element={<InterestReceivedPage />} />
          <Route path="dashboard/interestsent" element={<InterestSentPage />} />
          <Route path="dashboard/unlockedprofiles" element={<UnlockedProfilesPage />} />
          <Route path="dashboard/ideclined" element={<IDeclinedPage />} />
          <Route path="dashboard/theydeclined" element={<TheyDeclinedPage />} />
          <Route path="dashboard/shortlist" element={<ShortlistedProfilesPage />} />
          <Route path="dashboard/ignored" element={<IgnoredProfilesPage />} />
          <Route path="dashboard/blocked" element={<BlockedProfilesPage />} />
          <Route path="dashboard/myprofile" element={<MyProfilePage />} />
          <Route path="dashboard/profile/:id" element={<ProfileViewPage />} />
          <Route path="dashboard/membership" element={<MembershipPage />} />
          <Route path="dashboard/security" element={<ChangePasswordPage />} />
          <Route path="dashboard/delete" element={<DeleteProfilePage />} />
          <Route path="dashboard/feedback" element={<FeedbackPage />} />
          <Route path="dashboard/help" element={<HelpCenterPage />} />
          <Route path="dashboard/terms" element={<TermsConditionsPage />} />
          <Route path="dashboard/privacy" element={<PrivacyPolicyPage />} />
        </Route>
      </Route>
    </Routes>
    </>
  )
}

export default App
