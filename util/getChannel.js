/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").Interaction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
	return new Promise(async (resolve) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"**Tienes que estar en un canal de voz para usar este comando.**"
					),
				],
			});
			return resolve(false);
		}
		if (
			interaction.guild.members.me.voice.channel &&
			interaction.member.voice.channel.id !==
			interaction.guild.members.me.voice.channel.id
		) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"**Tienes que estar en mi mismo canal de voz para usar este comando.**"
					),
				],
			});
			return resolve(false);
		}
		if (!interaction.member.voice.channel.joinable) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"I don't have enough permission to join your voice channel!",
					),
				],
			});
			return resolve(false);
		}
		
		resolve(interaction.member.voice.channel);
	});
};
