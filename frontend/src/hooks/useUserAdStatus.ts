import { useContext, useEffect, useState } from "react";
import axios from "axios";

import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import { backendUrl } from "../constants/constants";

interface UserAdStatusResponse {
  data: {
    hasPaid: boolean;
    adFreeUntil: string | null;
  };
}

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const useUserAdStatus = () => {
  const { user } = useContext(UserAuthContext);
  const [hasPaid, setHasPaid] = useState(false);
  const [adFreeUntil, setAdFreeUntil] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    if (!user) {
      return () => {
        ignore = true;
      };
    }

    axios
      .get<UserAdStatusResponse>(
        `${backendUrl}/company-users/mine/ad-status`,
        authConfig(),
      )
      .then((response) => {
        if (!ignore) {
          setHasPaid(response.data.data.hasPaid);
          setAdFreeUntil(response.data.data.adFreeUntil);
          setHidden(false);
          setCheckedAt(Date.now());
        }
      })
      .catch(() => {
        if (!ignore) {
          // Hide the informational line whenever the current status is unavailable.
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
    checkedAt,
  };
};

export default useUserAdStatus;
