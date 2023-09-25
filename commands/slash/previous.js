const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
.setName("previous")
.setDescription("Go back to the previous song.")
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
					.setDescription("There are no previous songs for this session."),
			],
			ephemeral: true,
		});
	}

	const previousSong = player.queue.previous;
	const currentSong = player.queue.current;
	const nextSong = player.queue[0]

	if (!previousSong
		|| previousSong === currentSong
		|| previousSong === nextSong) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor("Red")
					.setDescription("There is no previous song in the queue."),
			],
		})}

	if (previousSong !== currentSong && previousSong !== nextSong) {
		player.queue.splice(0, 0, currentSong)
		player.play(previousSong);
	}
	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription(
					`⏮ | Previous song: **${ previousSong.title }**`,
				),
		],
	});
});

module.exports = command;
