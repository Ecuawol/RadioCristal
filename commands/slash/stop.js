const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("stop")
	.setDescription("Stops whatever the bot is playing and leaves the voice channel\n(This command will clear the queue)")
	
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
						.setDescription("I'm not in a channel."),
				],
				ephemeral: true,
			});
		}
		
		if (player.twentyFourSeven) {
			player.queue.clear();
			player.stop();
			player.set("autoQueue", false);
		} else {
			player.destroy();
		}
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`:wave: | **Bye Bye!**`),
			],
		});
	});

module.exports = command;
