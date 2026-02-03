const { getBan } = require("../../database-helper");
const { getBanEmbed } = require("../../discord-helper");
const { formatUnbanDate } = require("../../utility/date");
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
    try {
      console.log(interaction);
      const userid = interaction.options.getString("userid") ?? undefined;
      let ban = userid ? await getBan(interaction.client.db, userid) : null;
      if (!ban) {
        await interaction.reply({
          content: `No ban found for user ${userid}.`,
          flags: 1 << 6, // Ephemeral
        });
        return;
      }
      ban.AdminName = `<@${ban?.AdminID ?? "System?"}>`;
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
    } catch (e) {
      console.error(e);
    }
  },
};
