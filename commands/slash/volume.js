const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("volumen")
	.setDescription("Change the volume of the current song.")
	.addNumberOption((option) =>
		option
			.setName("cantidad")
			.setDescription("Amount of volume you want to change. Ex: 10")
			.setRequired(false),
	)
	.setRun(async (client, interaction) => {
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
						.setDescription("No hay música reproduciendo."),
				],
				ephemeral: true,
			});
		}
		
		let vol = interaction.options.getNumber("amount");
		if (!vol || vol < 1 || vol > 125) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(
							`:loud_sound: | Current volume **${ player.volume }**`,
						),
				],
			});
		}
		
		player.setVolume(vol);
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(
						`:loud_sound: | Volumen ajustado a **${ player.volume }**`,
					),
			],
		});
	});

module.exports = command;
