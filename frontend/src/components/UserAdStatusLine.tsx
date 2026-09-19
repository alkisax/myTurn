import { Typography } from "@mui/material";

import useUserAdStatus from "../hooks/useUserAdStatus";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const UserAdStatusLine = () => {
  const { hasPaid, adFreeUntil, loading, hidden, checkedAt } =
    useUserAdStatus();

  if (loading || hidden) {
    return null;
  }

  const adFreeDate = adFreeUntil ? new Date(adFreeUntil) : null;
  const hasActiveAdFreePeriod =
    adFreeDate !== null &&
    !Number.isNaN(adFreeDate.getTime()) &&
    checkedAt !== null &&
    adFreeDate.getTime() > checkedAt;
  const adFreeText = hasActiveAdFreePeriod
    ? `ad free period until: ${dateFormatter.format(adFreeDate)}`
    : "no ad free period";

  return (
    <Typography
      sx={{
        mt: "auto",
        py: 1,
        fontSize: "0.7rem",
        color: "text.disabled",
        textAlign: "center",
      }}
    >
      paid: {hasPaid ? "y" : "n"} | {adFreeText}
    </Typography>
  );
};

export default UserAdStatusLine;
