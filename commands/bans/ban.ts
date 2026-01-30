const { getBan } = require("../../database-helper");
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
} = require("discord.js");

module.exports = {
  roleNeeded: "418694554674266113",
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Opens up a modal to edit a ban for a user.")
    .addStringOption((option: any) =>
      option
        .setName("userid")
        .setDescription("Roblox UserID")
        .setRequired(true),
    ),
  async execute(interaction: any) {
    const userid = interaction.options.getString("userid") ?? undefined;
    console.log("Userid:", userid);
    let ban = userid ? await getBan(interaction.client.db, userid) : null;
    console.log("Ban found:", ban);
    const modalId = `banModal:${interaction.user.id}:${Date.now()}`;
    const modal = new ModalBuilder().setCustomId(modalId).setTitle("Ban Form");
    const unbanDateInput = new TextInputBuilder()
      .setCustomId("unbanDateInput")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("5D, 12H, 1Y, etc. Leave blank for permanent ban.")
      .setRequired(false)
      .setValue(ban ? formatUnbanDate(ban.UnbanDate) : "");
    const unbanLabel = new LabelBuilder()
      .setLabel("When should the ban be lifted?")
      .setDescription("Unban Date")
      .setTextInputComponent(unbanDateInput);
    // const isBannedInput = new StringSelectMenuBuilder()
    //   .setCustomId("isBanned")
    //   .setPlaceholder("Is the user banned?")
    //   // Modal only property on select menus to prevent submission, defaults to true
    //   .setRequired(true)
    //   .addOptions(
    //     // String select menu options
    //     new StringSelectMenuOptionBuilder()
    //       // Label displayed to user
    //       .setLabel("Banned")
    //       // Description of option
    //       .setDescription("Banned")
    //       // Value returned to you in modal submission
    //       .setValue("Banned")
    //       .setDefault(ban ? ban.Banned === true : false),
    //     new StringSelectMenuOptionBuilder()
    //       .setLabel("Unbanned")
    //       .setDescription("Unbanned")
    //       .setValue("Unbanned")
    //       .setDefault(ban ? ban.Banned === false : false),
    //   );
    // const isBannedLabel = new LabelBuilder()
    //   .setLabel("Enforced ban")
    //   // Set string select menu as component of the label
    //   .setStringSelectMenuComponent(isBannedInput);
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
      .setValue(ban ? (ban.Reason ?? "") : "");

    const reasonLabel = new LabelBuilder()
      .setLabel("What is the reason for the ban?")
      .setDescription("Ban reason")
      .setTextInputComponent(reasonInput);

    const proofInput = new TextInputBuilder()
      .setCustomId("proofInput")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Links, etc.")
      .setValue(ban ? (ban.Proof ?? "") : "");

    const proofLabel = new LabelBuilder()
      .setLabel("What is the proof for the ban?")
      .setDescription("Proof")
      .setTextInputComponent(proofInput);

    // modal.addLabelComponents(isBannedLabel);
    modal.addLabelComponents(reasonLabel);
    modal.addLabelComponents(proofLabel);
    modal.addLabelComponents(unbanLabel);

    try {
      await interaction.showModal(modal);
      let modalInteraction = await interaction.awaitModalSubmit({
        time: 180000,
        filter: (i: any) =>
          i.customId === modalId && i.user.id === interaction.user.id,
      });

      await interaction.client.modals.get("banModal")(
        modalInteraction,
        interaction,
      );
    } catch (error) {
      console.error("Error showing modal or awaiting submission:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
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
