const colors = require("colors");
const { EmbedBuilder } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
	.setName("autoqueue")
	.setDescription("Automatically add songs to the queue (toggle)")
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
						.setDescription("There's nothing playing in the queue"),
				],
				ephemeral: true,
			});
		}
		
		let autoQueueEmbed = new EmbedBuilder().setColor(client.config.embedColor);
		const autoQueue = player.get("autoQueue");
		player.set("requester", interaction.guild.me);
		
		if (!autoQueue || autoQueue === false) {
			player.set("autoQueue", true);
		} else {
			player.set("autoQueue", false);
		}
		autoQueueEmbed
		  .setDescription(`**Auto Queue is** \`${!autoQueue ? "ON" : "OFF"}\``)
		  .setFooter({
		    text: `Related music will ${!autoQueue ? "now be automatically" : "no longer be"} added to the queue.`
      });
		client.warn(
			`Player: ${ player.options.guild } | [${ colors.blue(
				"AUTOQUEUE",
			) }] has been [${ colors.blue(!autoQueue? "ENABLED" : "DISABLED") }] in ${
				client.guilds.cache.get(player.options.guild)
					? client.guilds.cache.get(player.options.guild).name
					: "a guild"
			}`,
		);
		
		return interaction.reply({ embeds: [autoQueueEmbed] });
	});

module.exports = command;
