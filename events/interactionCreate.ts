import { type Interaction } from "discord.js";
const { Collection, Events, MessageFlags } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.isModalSubmit()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      //   const { cooldowns } = interaction.client;
      //   if (!cooldowns.has(command.data.name)) {
      //     cooldowns.set(command.data.name, new Collection());
      //   }
      //   const now = Date.now();
      //   const timestamps = cooldowns.get(command.data.name);
      //   const defaultCooldownDuration = 3;
      //   const cooldownAmount =
      //     (command.cooldown ?? defaultCooldownDuration) * 1_000;
      //   if (timestamps.has(interaction.user.id)) {
      //     const expirationTime =
      //       timestamps.get(interaction.user.id) + cooldownAmount;
      //     if (now < expirationTime) {
      //       const expiredTimestamp = Math.round(expirationTime / 1_000);
      //       return interaction.reply({
      //         content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
      //         flags: MessageFlags.Ephemeral,
      //       });
      //     }
      //   }

      if (command.roleNeeded) {
        const member = interaction.member;
        if (
          !member ||
          !("cache" in member.roles) ||
          !member.roles.cache.has(command.roleNeeded)
        ) {
          await interaction.reply({
            content: "You do not have permission to use this command.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      await command.execute(interaction);
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
