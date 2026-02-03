const { messageservice_send_payload } = require("../opencloud-helper");
const { updateBan } = require("../database-helper");
const { getBanEmbed } = require("../discord-helper");
const { formatUnbanDate } = require("../utility/date");
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
  roleNeeded: "418694554674266113",
  name: "banModal",
  async execute(interaction: any, initalInteraction: any) {
    // Get UserID from the modal submitter
    const userid = interaction.user.id;

    try {
      let obj: any = {};
      obj.Banned = true;
      obj.UserID = initalInteraction.options.getString("userid").trim();
      obj.Reason = interaction.fields.getTextInputValue("reasonInput");
      obj.Proof = interaction.fields.getTextInputValue("proofInput");
      obj.AdminID = interaction.user.id;
      obj.AdminName = interaction.user.tag;
      obj.Length = 0;
      obj.UnbanDate =
        interaction.fields.getTextInputValue("unbanDateInput") !== ""
          ? new Date(
              formatUnbanDate(
                interaction.fields.getTextInputValue("unbanDateInput"),
              ),
            )
          : 0;
      obj.TestUniverse = false;
      await updateBan(interaction.client.db, obj);
      console.log("Parsed modal data:", obj);
      if (obj.Banned === true) {
        await messageservice_send_payload({
          type: "ban",
          for: obj.UserID,
          payload: {
            reason: obj.Reason,
            TestUniverse: obj.TestUniverse,
          },
        });
      }
      let embed = getBanEmbed(obj);
      await interaction.reply({ ...embed, flags: MessageFlags.Ephemeral });
      const webhookClient = new WebhookClient({
        url: Bun.env.DISCORD_BAN_LOG_WEBHOOK_URL,
      });
      await webhookClient.send({
        ...embed,
        content: `Banned user ${obj.UserID} by ${obj.AdminName} (${obj.AdminID})`,
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
