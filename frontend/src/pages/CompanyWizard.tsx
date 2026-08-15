import { useContext } from "react";

import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import RegisterAdminPageBackend from "../authLogin/loginBackend/RegisterAdminPageBackend";
import { backendUrl } from "../constants/constants";

const CompanyWizard = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAdmin =
    user?.roles.includes("ADMIN") ||
    user?.roles.includes("SUPERADMIN");

  if (isAdmin) {
    return (
      <div>
        <h1>Company Wizard</h1>
        <p>You are already an admin.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1>Company Wizard</h1>

        <RegisterAdminPageBackend url={backendUrl} />
      </div>
    );
  }

  return (
    <div>
      <h1>Company Wizard</h1>
      <p>
        You are currently logged in as {user.roles[0]}.
      </p>
    </div>
  );
};

export default CompanyWizard;