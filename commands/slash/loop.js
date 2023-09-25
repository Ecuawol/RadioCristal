const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("loop")
	.setDescription("Loops the current song")
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setDescription("El nodo de audio no está conectado, contacta a un administrador."),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setDescription("Nothing is playing right now."),
				],
				ephemeral: true,
			});
		}
		
		if (player.setTrackRepeat(!player.trackRepeat)) {
			;
		}
		const trackRepeat = player.trackRepeat? "enabled" : "disabled";
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`👍 | **Loop has been \`${ trackRepeat }\`**`),
			],
		});
	});

module.exports = command;
