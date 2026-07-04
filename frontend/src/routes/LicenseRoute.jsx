import { Navigate } from "react-router-dom";

const LICENSE_STORAGE_KEY = "agroshop_license";

// Sirf license check karo — koi backend call nahi
const LicenseRoute = ({ children }) => {
  const license = localStorage.getItem(LICENSE_STORAGE_KEY);

  if (!license) {
    return <Navigate to="/activate" replace />;
  }

  return children;
};

export default LicenseRoute;
