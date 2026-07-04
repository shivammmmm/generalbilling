import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LicenseKey from "./pages/auth/LicenseKey";
import MainLayout from "./layouts/MainLayout";
import LicenseRoute from "./routes/LicenseRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/farmers/Farmers";
import AddCustomer from "./pages/farmers/AddFarmer";
import EditCustomer from "./pages/farmers/EditFarmer";
import CustomerDetails from "./pages/farmers/FarmerDetails";
import Products from "./pages/products/Products";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import ProductDetails from "./pages/products/ProductDetails";
import Categories from "./pages/categories/Categories";
import Transactions from "./pages/transactions/Transactions";
import PaymentTransaction from "./pages/transactions/PaymentTransaction";
import CreditTransaction from "./pages/transactions/CreditTransaction";
import Invoices from "./pages/invoices/Invoices";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import PrintInvoice from "./pages/invoices/PrintInvoice";
import Billing from "./pages/billing/Billing";
import Reports from "./pages/reports/Reports";
import Users from "./pages/users/Users";
import Settings from "./pages/settings/Settings";

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/farmers", element: <Customers /> },
  { path: "/farmers/add", element: <AddCustomer /> },
  { path: "/farmers/edit/:id", element: <EditCustomer /> },
  { path: "/farmers/:id", element: <CustomerDetails /> },
  { path: "/products", element: <Products /> },
  { path: "/products/add", element: <AddProduct /> },
  { path: "/products/edit/:id", element: <EditProduct /> },
  { path: "/products/:id", element: <ProductDetails /> },
  { path: "/categories", element: <Categories /> },
  { path: "/billing", element: <Billing /> },
  { path: "/orders", element: <Navigate to="/billing" replace /> },
  { path: "/invoices", element: <Invoices /> },
  { path: "/invoices/create", element: <Navigate to="/billing" replace /> },
  { path: "/invoices/print/:id", element: <PrintInvoice /> },
  { path: "/invoices/:id", element: <InvoiceDetails /> },
  { path: "/transactions", element: <Transactions /> },
  { path: "/transactions/payment", element: <PaymentTransaction /> },
  { path: "/transactions/credit", element: <CreditTransaction /> },
  { path: "/reports", element: <Reports /> },
  { path: "/users", element: <Users /> },
  { path: "/settings", element: <Settings /> },
];

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Seedha activate page pe redirect */}
        <Route path="/" element={<Navigate to="/activate" replace />} />

        {/* License Key Activation Screen */}
        <Route path="/activate" element={<LicenseKey />} />

        {/* Old login/register routes redirect to activate */}
        <Route path="/login" element={<Navigate to="/activate" replace />} />
        <Route path="/register" element={<Navigate to="/activate" replace />} />

        {/* Protected routes — sirf license key se */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <LicenseRoute>
                <MainLayout>{route.element}</MainLayout>
              </LicenseRoute>
            }
          />
        ))}

        <Route
          path="*"
          element={
            <div className="flex h-screen flex-col items-center justify-center gap-3 px-4 text-center">
              <h1 className="text-3xl font-black text-slate-950">
                Page Not Found
              </h1>
              <p className="text-sm font-semibold text-slate-600">
                Go back to the AgroShop dashboard.
              </p>
              <a
                href="/dashboard"
                className="rounded-2xl bg-green-600 px-5 py-3 font-black text-white"
              >
                Go to Dashboard
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
