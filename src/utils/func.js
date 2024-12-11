const { default: axios } = require("axios");
const levelConfig = require("../config/config.json");
const TelegramBot = require("node-telegram-bot-api");

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
  getTelegramGroupId: async function (botToken, chat_id) {
    const url = `https://api.telegram.org/bot${botToken}/getChat?chat_id=@${chat_id}`;
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.ok) {
        return data.result;
      } else {
        throw new Error(
          "Error fetching telegram group info: " + data.description
        );
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
      return null;
    }
  },
  checkTelegramUserReplied: async function (botToken, userId, chatId, messageId) {
    const url = `https://api.telegram.org/bot${botToken}/getMessage?chat_id=${chatId}&message_id=${messageId}`;
    try {
      const response = await axios.get(url);
      const message = response.data.result;

      // Check if the message has replies
      if (message.reply_to_message) {
        // Check if the user who replied matches the userId we're looking for
        return message.from.id === userId;
      }
      return false;
    } catch (error) {
      console.error("Error checking user reply:", error.message);
      return false;
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

  userLevel: function (level_point) {
    let currentLevelIndex = levelConfig.level.findIndex(
      (level) => level.from <= level_point && level.to > level_point
    );
    return {
      ...levelConfig.level[currentLevelIndex],
      index: currentLevelIndex,
    };
  },
};
