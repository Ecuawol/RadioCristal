const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
	.setName("seek")
	.setDescription("Seek to a specific time in the current song.")
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("Seek to time you want. Ex 2m | 10s | 53s")
			.setRequired(true),
	)
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
		
		await interaction.deferReply();
		
		const args = interaction.options.getString("time");
		const time = ms(args);
		const position = player.position;
		const duration = player.queue.current.duration;
		
		if (time <= duration) {
			player.seek(time);
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(
							`⏩ | **${ player.queue.current.title }** has been ${
								time < position? "rewound" : "seeked"
							} to **${ ms(time) }**`,
						),
				],
			});
		} else {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(
							`Cannot seek current playing track. This may happened because seek duration has exceeded track duration`,
						),
				],
			});
		}
	});

module.exports = command;
