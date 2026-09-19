import { useContext, useEffect, useState } from "react";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { getAuthHeaders, api } from "@/hooks/companySetupHooks/api";
import { backendUrl } from "@/constants/constants";

interface UserAdStatusResponse {
  data: {
    hasPaid: boolean;
    adFreeUntil: string | null;
  };
}

const useUserAdStatus = () => {
  const { user } = useContext(UserAuthContext);
  const [hasPaid, setHasPaid] = useState(false);
  const [adFreeUntil, setAdFreeUntil] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!user) {
      return () => {
        ignore = true;
      };
    }

    getAuthHeaders()
      .then((headers) =>
        api.get<UserAdStatusResponse>(
          `${backendUrl}/company-users/mine/ad-status`,
          headers,
        ),
      )
      .then((response) => {
        if (!ignore) {
          setHasPaid(response.data.data.hasPaid);
          setAdFreeUntil(response.data.data.adFreeUntil);
          setHidden(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setHidden(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoaded(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  return {
    hasPaid,
    adFreeUntil,
    loading: user !== null && !loaded,
    hidden: !user || hidden,
  };
};

export default useUserAdStatus;
