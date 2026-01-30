const { getBan } = require("../../database-helper");

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
  roleNeeded: "918694554674266113",
  data: new SlashCommandBuilder()
    .setName("editban")
    .setDescription("Opens up a modal to edit a ban for a user.")
    .addStringOption((option: any) =>
      option.setName("userid").setDescription("Roblox UserID"),
    ),
  async execute(interaction: any) {
    const userid = interaction.options.getString("userid") ?? undefined;
    let ban = userid ? await getBan(interaction.client.db, userid) : null;
    console.log("Ban found:", ban);
    const modal = new ModalBuilder()
      .setCustomId("editBanModal")
      .setTitle("Ban Edit Form");
    const userInput = new TextInputBuilder()
      .setCustomId("userInput")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("UserID")
      .setRequired(true)
      .setValue(ban ? ban.UserID : "");
    const isBannedInput = new StringSelectMenuBuilder()
      .setCustomId("isBanned")
      .setPlaceholder("Is the user banned?")
      // Modal only property on select menus to prevent submission, defaults to true
      .setRequired(true)
      .addOptions(
        // String select menu options
        new StringSelectMenuOptionBuilder()
          // Label displayed to user
          .setLabel("Banned")
          // Description of option
          .setDescription("Banned")
          // Value returned to you in modal submission
          .setValue("Banned")
          .setDefault(ban ? ban.Banned === true : false),
        new StringSelectMenuOptionBuilder()
          .setLabel("Unbanned")
          .setDescription("Unbanned")
          .setValue("Unbanned")
          .setDefault(ban ? ban.Banned === false : false),
      );
    const isBannedLabel = new LabelBuilder()
      .setLabel("Enforced ban")
      // Set string select menu as component of the label
      .setStringSelectMenuComponent(isBannedInput);
    const userLabel = new LabelBuilder()
      .setLabel("User ID/Username")
      .setDescription("User to ban")
      .setTextInputComponent(userInput);
    // const unbanDateInput = new TextInputBuilder()
    //   .setCustomId("unbanDateInput")
    //   .setStyle(TextInputStyle.Short)
    //   .setPlaceholder("5D, 12H, 1Y, etc. Leave blank for permanent ban.")
    //   .setRequired(false)
    //   .setValue(ban && ban.UnbanDate ? formatUnbanDate(ban.UnbanDate) : "");
    // const unbanLabel = new LabelBuilder()
    //   .setLabel("When should the ban be lifted?")
    //   .setDescription("Unban Date")
    //   .setTextInputComponent(unbanDateInput);
    const reasonInput = new TextInputBuilder()
      .setCustomId("reasonInput")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("exploiting, abusing, etc.")
      .setValue(ban ? ban.Reason : "");

    const reasonLabel = new LabelBuilder()
      .setLabel("What is the reason for the ban?")
      .setDescription("Ban reason")
      .setTextInputComponent(reasonInput);

    const proofInput = new TextInputBuilder()
      .setCustomId("proofInput")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Links, etc.")
      .setValue(ban ? ban.Proof : "");

    const proofLabel = new LabelBuilder()
      .setLabel("What is the proof for the ban?")
      .setDescription("Proof")
      .setTextInputComponent(proofInput);

    //   Fetch the discord user's name from the admin id (discord id)
    const admin = ban
      ? await interaction.client.users.fetch(ban.AdminID)
      : { username: "Admin not found" };
    const text = new TextDisplayBuilder().setContent(
      `${admin ? admin.username : "New"}`,
    );

    modal.addLabelComponents(userLabel);
    modal.addLabelComponents(isBannedLabel);
    // modal.addLabelComponents(unbanLabel);
    modal.addLabelComponents(reasonLabel);
    modal.addLabelComponents(proofLabel);
    modal.addTextDisplayComponents(text);

    await interaction.showModal(modal);
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
