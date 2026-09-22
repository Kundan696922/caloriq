import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import HomePage from "./pages/HomePage";
import MaintenanceCalculatorPage from "./pages/MaintenanceCalculatorPage";
import GoalCalculatorPage from "./pages/GoalCalculatorPage";
import FoodSearchPage from "./pages/FoodSearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import WeightProgressPage from "./pages/WeightProgressPage";
import MealsPage from "./pages/MealsPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        <Route
          path="/calculators/maintenance"
          element={<MaintenanceCalculatorPage />}
        />

        <Route path="/calculators/goal" element={<GoalCalculatorPage />} />

        <Route path="/foods" element={<FoodSearchPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />

          {/* Add future logged-in pages here */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/progress" element={<WeightProgressPage />} />
        </Route>

        {/* Other Pages */}
        <Route path="/coming-soon" element={<ComingSoonPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
