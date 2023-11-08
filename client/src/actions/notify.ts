import axios from "axios";

export const NOTIFY = "NOTIFY";

export const notify = async (data: object) => {
  const response = await axios.post("/notification", data).then(res => res.data);
  return {
    type: "NOTIFY",
    payload: response
  };
}