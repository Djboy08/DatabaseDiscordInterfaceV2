const { getBan, updateBan } = require("../../database-helper");
const { messageservice_send_payload } = require("../../opencloud-helper");
const { getBanEmbed } = require("../../discord-helper");
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
  roleNeeded: "418694554674266113",
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Opens up a modal to edit a ban for a user.")
    .addStringOption((option: any) =>
      option
        .setName("userid")
        .setDescription("Roblox UserID")
        .setRequired(true),
    )
    .addStringOption((option: any) =>
      option
        .setName("reason")
        .setDescription("Reason for unbanning the user")
        .setRequired(true),
    ),
  async execute(interaction: any) {
    const userid = interaction.options.getString("userid") ?? undefined;
    const reason = interaction.options.getString("reason") ?? undefined;
    let ban = userid ? await getBan(interaction.client.db, userid) : null;
    console.log("Ban found:", ban);
    if (ban) {
      try {
        let obj: any = {};
        obj.Banned = false;
        obj.UserID = userid.trim();
        obj.Reason = ban.Reason;
        obj.Proof = ban.Proof;
        obj.AdminID = interaction.user.id;
        obj.AdminName = interaction.user.tag;
        obj.Length = 0;
        obj.UnbanDate = 0;
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
        await interaction.reply({
          ...embed,
          flags: MessageFlags.Ephemeral,
        });
        const webhookClient = new WebhookClient({
          url: Bun.env.DISCORD_BAN_LOG_WEBHOOK_URL,
        });
        await webhookClient.send({
          ...embed,
          content: `Unbanned user ${obj.UserID} by ${obj.AdminName} (${obj.AdminID}) with reason: "${reason}"`,
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
    }

    interaction
      .awaitModalSubmit({
        time: 60_000,
        filter: (i: any) => i.user.id === interaction.user.id,
      })
      .then(async (i: any) => {
        await interaction.client.modals.get("banModal")(i, interaction);
      })
      .catch((err: any) =>
        console.log("No modal submit interaction was collected", err),
      );
  },
};
function formatUnbanDate(UnbanDate: any): string | Date {
  // If the UnbanDate is in a duration format (e.g., "5D", "12H"), convert it to an ISO date
  // Otherwise if its an actual ISO date, return that
  if (typeof UnbanDate === "string" && /^[0-9]+[DHMYS]$/.test(UnbanDate)) {
    const durationRegex = /(\d+)([DHMYS])/;
    const match = UnbanDate.toString().match(durationRegex);
    if (!match) return "";

    const value = parseInt(match[1]);
    const unit = match[2];

    const now = new Date();
    let unbanDate = new Date(now);

    switch (unit) {
      case "D":
        unbanDate.setDate(now.getDate() + value);
        break;
      case "H":
        unbanDate.setHours(now.getHours() + value);
        break;
      case "M":
        unbanDate.setMinutes(now.getMinutes() + value);
        break;
      case "S":
        unbanDate.setSeconds(now.getSeconds() + value);
        break;
      case "Y":
        unbanDate.setFullYear(now.getFullYear() + value);
        break;
    }

    return unbanDate.toISOString();
  }
  if (!UnbanDate) return "";
  const date = new Date(UnbanDate);
  return date.toISOString();
}
