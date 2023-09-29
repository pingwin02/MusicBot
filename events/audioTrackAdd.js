const { GuildQueueEvent } = require("discord-player");
const { logInfo } = require("../functions");

module.exports = {
  name: GuildQueueEvent.audioTrackAdd,
  type: "player.events",
  async execute(queue, track) {
    logInfo(`[${queue.guild.name}] Added ${track.title} (${track.url})`);
  },
};
