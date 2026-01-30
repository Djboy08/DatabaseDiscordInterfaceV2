import { type Interaction } from "discord.js";
const { messageservice_send_payload } = require("../opencloud-helper");
const { updateBan } = require("../database-helper");
const { getBanEmbed } = require("../discord-helper");
const {
  Collection,
  Events,
  MessageFlags,
  WebhookClient,
} = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    console.log("0");
    if (!interaction.isModalSubmit()) return;
    // get modal ID
    console.log("0.5");
    if (interaction.customId !== "editban") return;
    console.log("1");
    try {
      //   console.log("Modal submitted:", interaction);
      let obj: any = {};
      obj.Banned =
        interaction.fields.getStringSelectValues("isBanned")[0] === "Banned";
      obj.UserID = interaction.fields.getTextInputValue("userInput").trim();
      obj.Reason = interaction.fields.getTextInputValue("reasonInput");
      obj.Proof = interaction.fields.getTextInputValue("proofInput");
      obj.AdminID = interaction.user.id;
      obj.AdminName = interaction.user.tag;
      obj.Length = 0;
      obj.UnbanDate = 0;
      obj.TestUniverse = false;
      console.log("1.5");
      await updateBan(interaction.client.db, obj);
      console.log("2");
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
        content: `Ban updated by ${obj.AdminName} (${obj.AdminID})`,
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
