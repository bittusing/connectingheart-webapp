import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { GlobalToastContainer } from './components/common/GlobalToastContainer'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
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
import { PersonalDetailsPage } from './pages/PersonalDetailsPage'
import { CareerDetailsPage } from './pages/CareerDetailsPage'
import { SocialDetailsPage } from './pages/SocialDetailsPage'
import { SRCMDetailsPage } from './pages/SRCMDetailsPage'
import { FamilyDetailsPage } from './pages/FamilyDetailsPage'
import { PartnerPreferencesPage } from './pages/PartnerPreferencesPage'
import { PartnerPreferenceEditPage } from './pages/PartnerPreferenceEditPage'
import { AboutYouPage } from './pages/AboutYouPage'
import { AcceptancePage } from './pages/AcceptancePage'
import { EditProfileBasicPage } from './pages/EditProfileBasicPage'
import { EditAboutPage } from './pages/EditAboutPage'
import { EditEducationPage } from './pages/EditEducationPage'
import { EditCareerPage } from './pages/EditCareerPage'
import { EditFamilyPage } from './pages/EditFamilyPage'
import { EditContactPage } from './pages/EditContactPage'
import { EditHoroscopePage } from './pages/EditHoroscopePage'
import { EditLifestylePage } from './pages/EditLifestylePage'
import { ChatListPage } from './pages/ChatListPage'
import { ChatPage } from './pages/ChatPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RootRedirect } from './routes/RootRedirect'

function App() {
  return (
    <>
      <GlobalToastContainer />
      <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<RootRedirect />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="under-verification" element={<VerificationPendingPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard/personaldetails" element={<PersonalDetailsPage />} />
        <Route path="dashboard/careerdetails" element={<CareerDetailsPage />} />
        <Route path="dashboard/socialdetails" element={<SocialDetailsPage />} />
        <Route path="dashboard/srcmdetails" element={<SRCMDetailsPage />} />
        <Route path="dashboard/familydetails" element={<FamilyDetailsPage />} />
        <Route path="dashboard/partnerpreferences" element={<PartnerPreferencesPage />} />
        <Route path="dashboard/aboutyou" element={<AboutYouPage />} />
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
        <Route path="dashboard/editprofilebasic" element={<EditProfileBasicPage />} />
        <Route path="dashboard/editabout" element={<EditAboutPage />} />
        <Route path="dashboard/editeducation" element={<EditEducationPage />} />
        <Route path="dashboard/editcareer" element={<EditCareerPage />} />
        <Route path="dashboard/editfamily" element={<EditFamilyPage />} />
        <Route path="dashboard/editcontact" element={<EditContactPage />} />
        <Route path="dashboard/edithoroscope" element={<EditHoroscopePage />} />
        <Route path="dashboard/editlifestyle" element={<EditLifestylePage />} />
          <Route path="dashboard/profile/:id" element={<ProfileViewPage />} />
          <Route path="dashboard/chats" element={<ChatListPage />} />
          <Route path="dashboard/chat/:userId" element={<ChatPage />} />
          <Route path="dashboard/membership" element={<MembershipPage />} />
          <Route path="dashboard/security" element={<ChangePasswordPage />} />
          <Route path="dashboard/delete" element={<DeleteProfilePage />} />
          <Route path="dashboard/feedback" element={<FeedbackPage />} />
          <Route path="dashboard/help" element={<HelpCenterPage />} />
          <Route path="dashboard/terms" element={<TermsConditionsPage />} />
          <Route path="dashboard/privacy" element={<PrivacyPolicyPage />} />
          <Route path="dashboard/partnerpreference" element={<PartnerPreferenceEditPage />} />
          <Route path="acceptance" element={<AcceptancePage />} />
        </Route>
      </Route>
    </Routes>
    </>
  )
}

export default App
