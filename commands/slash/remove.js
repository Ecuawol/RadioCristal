const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("remove")
	.setDescription("Remove track you don't want from queue")
	.addNumberOption((option) =>
		option
			.setName("number")
			.setDescription("Enter track number.")
			.setRequired(true),
	)
	
	.setRun(async (client, interaction) => {
		const args = interaction.options.getNumber("number");
		
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
						.setDescription("There are no songs to remove."),
				],
				ephemeral: true,
			});
		}
		
		await interaction.deferReply();
		
		const position = Number(args) - 1;
		if (position > player.queue.size) {
			let thing = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription(
					`Current queue has only **${ player.queue.size }** track`,
				);
			return interaction.editReply({ embeds: [thing] });
		}
		
		const song = player.queue[position];
		player.queue.remove(position);
		
		const number = position + 1;
		let removeEmbed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setDescription(`Removed track number **${ number }** from queue`);
		return interaction.editReply({ embeds: [removeEmbed] });
	});

module.exports = command;
