import RegisterAdminPageBackend from "../../../authLogin/loginBackend/RegisterAdminPageBackend";
import { backendUrl } from "../../../constants/constants";

const Step1RegisterAdmin = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Step 1 — Create your admin account
      </h1>

      <p className="max-w-lg text-center">
        MyTurn helps you organize your company as Company → Locations →
        Queues → Desks. Staff belong to the company and serve customers at
        desks, while services describe what customers can request.
      </p>

      <p className="max-w-lg text-center">
        Customers receive tickets for a queue and may optionally choose
        services. This wizard will guide you through the setup step by step.
      </p>

      <RegisterAdminPageBackend url={backendUrl} />
    </div>
  );
};

export default Step1RegisterAdmin;
