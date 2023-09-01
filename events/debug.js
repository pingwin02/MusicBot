const { GuildQueueEvent } = require("discord-player");
const { logDebug } = require("../functions");

module.exports = {
  name: GuildQueueEvent.debug,
  type: "player",
  async execute(message) {
    // Emitted when the player sends debug info
    // Useful for seeing what dependencies, extractors, etc are loaded
    // logDebug(message); // Uncomment this line to log debug messages from discord-player
  },
};
