const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("skip")
	.setDescription("Salta la canción actual")
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
						.setDescription("No estoy reproduciendo nada"),
				],
				ephemeral: true,
			});
		}
        
        if (player.queue[0] == undefined) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor("Red")
					// .setDescription(`There is nothing after [${ song.title }](${ song.uri }) in the queue.`),
					.setDescription("No hay nada después de [${ song.title }](${ song.uri }) en la cola."),
			],
		})}
		
		player.queue.previous = player.queue.current;
		player.stop();
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					// .setDescription("✅ | **Skipped!**"),
					.setDescription("✅ | **Saltado**"),
			],
		});
	});

module.exports = command;
