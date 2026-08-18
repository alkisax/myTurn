// native\src\utils\logToServer.ts
import axios from "axios";
import { appName, backendUrl } from "@/constants/constants";

export const logToServer = async (msg: string) => {
  const formattedMsg = `[${appName}] ${msg}`;

  try {
    console.log(formattedMsg);

    await axios.post(`${backendUrl}/api/log-from-front`, {
      data: formattedMsg,
    });
  } catch (err) {
    console.log(err);
  }
};
