import axios from "axios";

export const fetchGoogleUserInfo = async (accessToken: string) => {
  const res = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { name, email, picture } = res.data;

  return { name, email, image: picture };
};