import RegisterAdminPageBackend from "../../../authLogin/loginBackend/RegisterAdminPageBackend";
import { backendUrl } from "../../../constants/constants";

const Step1RegisterAdmin = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Step 1 — Create your admin account
      </h1>

      <RegisterAdminPageBackend url={backendUrl} />
    </div>
  );
};

export default Step1RegisterAdmin;