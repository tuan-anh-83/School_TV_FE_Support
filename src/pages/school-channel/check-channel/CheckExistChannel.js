import apiFetch from "../../../config/baseAPI";

export const checkExistChannel = async (accountID) => {
  const params = new URLSearchParams();
  params.append("accountId", accountID || null);
  console.log("fetch from function");
  const url = `/api/schoolchannels/search?${params.toString()}`;

  try {
    const response = await apiFetch(url, { method: "GET" });
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Có lỗi xảy ra!");
    }

    const data = await response.json();
    // Save the entire response to localStorage
    localStorage.setItem("schoolChannelData", JSON.stringify(data));
    return data;
  } catch (error) {
    throw error;
  }
};
