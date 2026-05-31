const { getBan, updateBan } = require("../../database-helper");
const { messageservice_send_payload } = require("../../opencloud-helper");
const { getBanEmbed } = require("../../discord-helper");
const { formatUnbanDate } = require("../../utility/date");
const banModal = require("../../modals/ban.ts");

const {
  SlashCommandBuilder,
  LabelBuilder,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  TextDisplayBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
  WebhookClient,
} = require("discord.js");

module.exports = {
  roleNeeded: ["165239721067413504", "987036412027240518"], // @Developer and @Headless respectively
  data: new SlashCommandBuilder()
    .setName("global-shout")
    .setDescription("Sends a global shout to all users in the game.")
    .addStringOption((option: any) =>
      option
        .setName("message")
        .setDescription("The message to send to all users in the game.")
        .setRequired(true),
    ),
  async execute(interaction: any) {
    const message = interaction.options.getString("message") ?? undefined;
    console.log("Message to send:", message);
    try {
      await messageservice_send_payload({
        type: "global-shout",
        payload: {
          message: message,
        },
      });
      await interaction.reply({
        content: `Successfully sent global shout with message: ${message}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
