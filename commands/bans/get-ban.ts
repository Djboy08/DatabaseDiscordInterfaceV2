const { getBan } = require("../../database-helper");
const { getBanEmbed } = require("../../discord-helper");

const {
  SlashCommandBuilder,
  LabelBuilder,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  TextDisplayBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  roleNeeded: "418694554674266113",
  data: new SlashCommandBuilder()
    .setName("get-ban")
    .setDescription("Gets the ban information for a user.")
    .addStringOption((option: any) =>
      option
        .setName("userid")
        .setDescription("Roblox UserID")
        .setRequired(true),
    ),
  async execute(interaction: any) {
    const userid = interaction.options.getString("userid") ?? undefined;
    let ban = userid ? await getBan(interaction.client.db, userid) : null;
    ban.AdminName = `<@${ban?.AdminID ?? "System?"}>`;
    if (!ban) {
      await interaction.reply({
        content: `No ban found for user ${userid}.`,
        flags: 1 << 6, // Ephemeral
      });
      return;
    }
    let embed = getBanEmbed({
      UserID: ban.UserID,
      Banned: ban.Banned,
      Length: ban.Length,
      Reason: ban.Reason,
      Proof: ban.Proof,
      UnbanDate: ban.UnbanDate,
      AdminName: ban.AdminName,
      TestUniverse: ban.TestUniverse,
    });
    await interaction.reply({ ...embed, flags: 1 << 6 }); // Ephemeral
  },
};
function formatUnbanDate(UnbanDate: any): string {
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
  if (!UnbanDate) return "";
  const date = new Date(UnbanDate);
  return date.toISOString().slice(0, 10); // Format as YYYY-MM-DD
}
