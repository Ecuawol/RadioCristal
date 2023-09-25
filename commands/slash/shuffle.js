const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("shuffle")
	.setDescription("Randomizes the queue")
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
						.setDescription("No hay música reproduciendo."),
				],
				ephemeral: true,
			});
		}
		
		if (!player.queue || !player.queue.length || player.queue.length === 0) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setDescription("There are not enough songs in the queue."),
				],
				ephemeral: true,
			});
		}
		
		//  if the queue is not empty, shuffle the entire queue
		player.queue.shuffle();
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription("🔀 | **Successfully shuffled the queue.**"),
			],
		});
	});

module.exports = command;
