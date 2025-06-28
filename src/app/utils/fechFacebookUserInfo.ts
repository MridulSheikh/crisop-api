import axios from "axios";

export const fetchFacebookUserInfo = async (accessToken: string) => {
  const res = await axios.get(
    "https://graph.facebook.com/me",
    {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    }
  );

  const { name, email, picture } = res.data;

  return {
    name,
    email,
    image: picture?.data?.url || null, // Facebook returns picture in nested format
  };
};
