const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Wyświetla informacje o bocie"),
  run: async ({ client, interaction }) => {
    await interaction.reply({
      content:
        `**${client.user.username}#${client.user.discriminator}**\n` +
        `🏓 Ping wynosi ${Date.now() - interaction.createdTimestamp}ms.\n` +
        'Stworzony z ❤️ przez <@!393430226341986324>',
      ephemeral: true,
    });
  },
};
