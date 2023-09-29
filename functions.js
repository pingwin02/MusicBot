const fs = require("fs");
const { inspect } = require("util");
const { EmbedBuilder } = require("discord.js");
const { Track } = require("discord-player");

const ERROR_TIMEOUT = 15000;
const INFO_TIMEOUT = 25000;

module.exports = {
  ERROR_TIMEOUT,
  INFO_TIMEOUT,
  logInfo,
  logDebug,
  printError,
  printNowPlaying,
  printTrackInfo,
  printInfo,
  msToTime,
  loadEvents,
};

/**
 * Logs information to the console and appends it to a log file.
 * @param {string} info - Information to log.
 * @param {Error} error - Error to log (optional)
 *
 * @returns {void}
 */
function logInfo(info, error = null) {
  var currentdate = new Date()
    .toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })
    .replace(",", "");

  var logMessage = `[${currentdate}] - `;

  if (error) {
    logMessage += `[ERROR] ${info}: ${inspect(error, {
      depth: 0,
    })}`;
  } else {
    logMessage += `[INFO] ${info}`;
  }

  console.log(logMessage);

  fs.appendFile("logs/log.log", `${logMessage}\n`, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
}

/**
 * Logs debug information to the console and appends it to a debug file.
 * @param {string} info - Information to log.
 * @returns {void}
 */

function logDebug(info) {
  var currentdate = new Date()
    .toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    })
    .replace(",", "");

  var logMessage = `[${currentdate}] - [DEBUG] ${info}`;

  console.debug(logMessage);

  fs.appendFile("logs/debug.log", `${logMessage}\n`, (err) => {
    if (err) {
      console.error("Error writing to debug file:", err);
    }
  });
}

/**
 * Sends embed with error message to the interaction channel,
 * then deletes it after ERROR_TIMEOUT.
 * @param {CommandInteraction} interaction - Interaction to reply to.
 * @param {string} error - Error message.
 * @param {boolean} followUp - Whether to use followUp or editReply.
 * @returns {void}
 */

function printError(interaction, error, followUp = false) {
  try {
    if (followUp) {
      return interaction
        .followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle(":x: Błąd!")
              .setDescription(error)
              .setColor("Red"),
          ],
        })
        .then((msg) => {
          setTimeout(
            () =>
              msg.delete().catch((err) => {
                logInfo("printError", err);
              }),
            ERROR_TIMEOUT
          );
        });
    } else {
      return interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(":x: Błąd!")
              .setDescription(error)
              .setColor("Red"),
          ],
        })
        .then((msg) => {
          setTimeout(
            () =>
              msg.delete().catch((err) => {
                logInfo("printError", err);
              }),
            ERROR_TIMEOUT
          );
        });
    }
  } catch (err) {
    logInfo("printError", err);
  }
}

/**
 * Sends embed with now playing track info to the interaction channel,
 * then deletes it after INFO_TIMEOUT.
 * @param {CommandInteraction} interaction - Interaction to reply to.
 * @param {Queue} queue - Queue to get track info from.
 * @param {boolean} reply - If true, reply to interaction.
 * @returns {void}
 */

function printNowPlaying(interaction, queue, reply = false) {
  try {
    let bar = queue.node.createProgressBar({
      queue: false,
      length: 10,
      timecodes: true,
    });

    let embed = new EmbedBuilder()
      .setTitle(
        "Teraz gra" +
          (queue.repeatMode == 1 ? " (:repeat_one: powtarzanie utworu)" : "") +
          (queue.repeatMode == 2
            ? " (:repeat: powtarzanie całej kolejki)"
            : "") +
          (queue.node.isPaused() ? "\n(:pause_button: wstrzymane)" : "")
      )
      .setDescription(
        `[**${queue.currentTrack.title}**](${queue.currentTrack.url})\n` +
          `Autor **${queue.currentTrack.author}**\n` +
          `*dodane przez <@${queue.currentTrack.requestedBy.id}>*\n\n` +
          `**Postęp:**\n${bar} `
      )
      .setThumbnail(queue.currentTrack.thumbnail)
      .setFooter({ text: `Głośność: ${queue.node.volume}` })
      .setColor("Blue");

    if (!reply) {
      interaction
        .send({
          embeds: [embed],
        })
        .then((msg) => {
          setTimeout(
            () =>
              msg.delete().catch((err) => {
                logInfo("printNowPlaying", err);
              }),
            INFO_TIMEOUT
          );
        })
        .catch((err) => {
          logInfo("printNowPlaying", err);
        });
    } else {
      interaction
        .editReply({
          embeds: [embed],
        })
        .then((msg) => {
          setTimeout(
            () =>
              msg.delete().catch((err) => {
                logInfo("printNowPlaying", err);
              }),
            INFO_TIMEOUT
          );
        })
        .catch((err) => {
          logInfo("printNowPlaying", err);
        });
    }
  } catch (err) {
    logInfo("printNowPlaying", err);
  }
}

/**
 * Sends embed with track info to the interaction channel,
 * then deletes it after INFO_TIMEOUT.
 * @param {CommandInteraction} interaction - Interaction to reply to.
 * @param {Track} track - Track to get info from.
 * @param {string} title - Embed title.
 * @param {string} description - Embed description.
 * @returns {void}
 */
function printTrackInfo(interaction, track, title, description) {
  return interaction
    .editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setDescription(description + " :musical_note:")
          .setThumbnail(track.thumbnail)
          .setFooter({ text: `Przez ${track.requestedBy.username}` })
          .setColor("Yellow"),
      ],
    })
    .then((msg) => {
      setTimeout(
        () =>
          msg.delete().catch((err) => {
            logInfo("printTrackInfo", err);
          }),
        INFO_TIMEOUT
      );
    })
    .catch((err) => {
      logInfo("printTrackInfo", err);
    });
}

/**
 * Sends embed with info to the interaction channel,
 * then deletes it after INFO_TIMEOUT.
 * @param {CommandInteraction} interaction - Interaction to reply to.
 * @param {string} title - Embed title.
 * @param {string} description - Embed description.
 * @returns {void}
 */
function printInfo(interaction, title, description) {
  return interaction
    .editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setDescription(description + " :musical_note:")
          .setFooter({ text: `Przez ${interaction.user.username}` })
          .setColor("Green"),
      ],
    })
    .then((msg) => {
      setTimeout(
        () =>
          msg.delete().catch((err) => {
            logInfo("printInfo", err);
          }),
        INFO_TIMEOUT
      );
    })
    .catch((err) => {
      logInfo("printInfo", err);
    });
}

/**
 * Converts a number of milliseconds to a human-readable time format.
 * @param {number} ms - Number of milliseconds to convert.
 * @returns {string} Human-readable time format.
 */
function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " sekund";
  else if (minutes < 60) return minutes + " minut";
  else if (hours < 24) return hours + " godzin";
  else return days + " dni";
}

/**
 * Loads all events from a folder.
 * @param {EventEmitter} receiver - Event receiver.
 * @param {string} folderPath - Path to the folder.
 * @returns {void}
 */
function loadEvents(receiver, folderPath) {
  const events = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of events) {
    const event = require(`${folderPath}/${file}`);
    if (event.once) {
      receiver.once(event.name, (...args) => event.execute(...args));
    } else {
      receiver.on(event.name, (...args) => event.execute(...args));
    }
  }
}
