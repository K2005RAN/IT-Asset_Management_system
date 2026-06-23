import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Your newly updated modern landing page file
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/LoginPage";
import { Admin } from "./pages/Admin";
import Asset from "./pages/Asset";
import UserManagementPage from "./pages/UserManagementPage";
import Employee from "./pages/Employee";
import AddNewAssetPage from "./pages/AddNewAssetPage";
import NewUser from "./pages/NewUser";
import AddAssetFormPage from "./pages/AddAssetFormPage";
import EditAssetPage from "./components/EditAsset";
import EditUserPage from "./pages/EditUserPage";
import AssignedAssetPage from "./pages/AssignedAssetPage";
import RepairHistory from './pages/RepairHistory';
function App() {

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                {/* Public Authentication Pipeline */}
                <Route path="/" element={<AuthLayout />} >
                    <Route index element={<HomePage />} /> {/* Clean, premium front landing page */}
                    <Route path="/login" element={<LoginPage />} />
                    {/* ❌ REMOVED: SignupPage route completely taken out to ensure strict access control */}
                </Route>
                <Route path="/repair-history" element={<RepairHistory />} />
                {/* Secure Master Platform Workspace */}
                <Route path="/" element={<MainLayout />}>
                    {/* Multi-role administration links to stop dashboard page splits */}
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin-dashboard" element={<Admin />} />
                    
                    <Route path="/asset-inventory" element={<Asset />} />
                    <Route path="/user-management" element={<UserManagementPage />} />
                    <Route path="/employee-dashboard" element={<Employee />} />
                    <Route path="/add-newAsset" element={<AddNewAssetPage />} />
                    <Route path="/create-user" element={<NewUser />} />
                    <Route path="/add-asset" element={<AddAssetFormPage />} />
                    <Route path="/edit-asset/:id" element={<EditAssetPage />} />
                    <Route path="/assigned-assets" element={<AssignedAssetPage />} />
                    <Route path="/edit-user/:id" element={<EditUserPage />} />
                    
                    {/* Global Fallback Route Redirects */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
            </>
        )
    );

    return (
        <RouterProvider router={router} />
    );
}

export default App;