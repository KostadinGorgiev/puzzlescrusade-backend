const { default: axios } = require("axios");

module.exports = {
  getUserProfilePhotos: async function (botToken, userId) {
    const url = `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}`;
    try {
      const response = await axios.get(url);
      const data = await response.json();

      if (data.ok) {
        return data.result;
      } else {
        throw new Error("Error fetching profile photos: " + data.description);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      return null;
    }
  },

  getUserProfilePhotos: async function (botToken, userId) {
    const url = `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}`;
    try {
      const response = await axios.get(url);

      if (response.data.ok) {
        return response.data.result;
      } else {
        throw new Error("Error fetching profile photos: " + data.description);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      return null;
    }
  },

  getFile: async function (botToken, fileId) {
    const url = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    try {
      const response = await axios.get(url);

      if (response.data) {
        const filePath = response.data.result.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        return fileUrl;
      } else {
        throw new Error("Error fetching file: " + response.data.description);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      return null;
    }
  },

  fetchUserProfilePhotoUrl: async function (botToken, userId) {
    const photos = await module.exports.getUserProfilePhotos(botToken, userId);

    if (photos && photos.total_count > 0) {
      const photo = photos.photos[0][0]; // Get the smallest size of the first photo
      const fileUrl = await module.exports.getFile(botToken, photo.file_id);
      return fileUrl;
    } else {
      console.log("No profile photos found for this user.");
      return null;
    }
  },
};
