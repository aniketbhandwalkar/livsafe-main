import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import DoctorDashboard from "@/pages/DoctorDashboard";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import GradeReport from "@/pages/GradeReport";
import Search from "@/pages/Search";
import ChatPage from "@/pages/ChatPage";
import PatientRecordView from "@/pages/PatientRecordView";
import About from "@/pages/About";
import Help from "@/pages/Help";
import UpdatePassword from "@/pages/UpdatePassword";
import OrganizationProfile from "@/pages/OrganizationProfile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/doctor/dashboard" component={DoctorDashboard} />
      <Route path="/doctor/grade" component={GradeReport} />
      <Route path="/doctor/search" component={Search} />
      <Route path="/organization/dashboard" component={OrganizationDashboard} />
      <Route path="/organization/profile" component={OrganizationProfile} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/doctor/record/:id" component={PatientRecordView} />
      <Route path="/update-password" component={UpdatePassword} />
      <Route path="/about" component={About} />
      <Route path="/help" component={Help} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
