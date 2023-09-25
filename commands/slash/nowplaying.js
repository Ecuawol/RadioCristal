const { EmbedBuilder } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
	.setName("nowplaying")
	.setDescription("Shows the song currently playing in the voice channel.")
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
						.setDescription("El bot no está en el canal de voz"),
				],
				ephemeral: true,
			});
		}
		
		if (!player.playing) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setDescription("No hay nada reproduciéndose."),
				],
				ephemeral: true,
			});
		}
		
		const song = player.queue.current;
		const embed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setAuthor({ name: "Reproduciendo...", iconURL: client.config.iconURL })
			// show who requested the song via setField, also show the duration of the song
			.setFields([
				{
					name: "Pedida por",
					value: `<@${ song.requester.id }>`,
					inline: true,
				},
				// show duration, if live show live
				{
					name: "Duración",
					value: song.isStream
						? `\`EN VIVO\``
						: `\`${ prettyMilliseconds(player.position, {
							secondsDecimalDigits: 0,
						}) } / ${ prettyMilliseconds(song.duration, {
							secondsDecimalDigits: 0,
						}) }\``,
					inline: true,
				},
			])
			// show the thumbnail of the song using displayThumbnail("maxresdefault")
			.setThumbnail(song.displayThumbnail("maxresdefault"))
			// show the title of the song and link to it
			.setDescription(`[${ song.title }](${ song.uri })`);
		return interaction.reply({ embeds: [embed] });
	});
module.exports = command;
