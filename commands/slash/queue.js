const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const load = require("lodash");
const pms = require("pretty-ms");

const command = new SlashCommand()
	.setName("queue")
	.setDescription("Shows the current queue")
	
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
						.setDescription("There are no songs in the queue."),
				],
				ephemeral: true,
			});
		}
		
		if (!player.playing) {
			const queueEmbed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription("There's nothing playing.");
			return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
		}
		
		await interaction.deferReply().catch(() => {
		});
		
		if (!player.queue.size || player.queue.size === 0) {
			let song = player.queue.current;
			const queueEmbed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription(`**♪ | Now playing:** [${ song.title }](${ song.uri })`)
				.addFields(
					{
						name: "Duration",
						value: song.isStream
							? `\`LIVE\``
							: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
								player.queue.current.duration,
								{ colonNotation: true },
							) }\``,
						inline: true,
					},
					{
						name: "Volume",
						value: `\`${ player.volume }\``,
						inline: true,
					},
					{
						name: "Total Tracks",
						value: `\`${ player.queue.totalSize - 1 }\``,
						colonNotation: true,
						inline: true,
					},
				);
			
			await interaction.editReply({
				embeds: [queueEmbed],
			});
		} else {
			let queueDuration = player.queue.duration.valueOf()
			if (player.queue.current.isStream) {
				queueDuration -= player.queue.current.duration
			}
			for (let i = 0; i < player.queue.length; i++) {
				if (player.queue[i].isStream) {
					queueDuration -= player.queue[i].duration
				}
			}
			
			const mapping = player.queue.map(
				(t, i) => `\` ${ ++i } \` [${ t.title }](${ t.uri }) [${ t.requester }]`,
			);
			
			const chunk = load.chunk(mapping, 10);
			const pages = chunk.map((s) => s.join("\n"));
			let page = interaction.options.getNumber("page");
			if (!page) {
				page = 0;
			}
			if (page) {
				page = page - 1;
			}
			if (page > pages.length) {
				page = 0;
			}
			if (page < 0) {
				page = 0;
			}
			
			if (player.queue.size < 11 || player.queue.totalSize < 11) {
				let song = player.queue.current;
				const embedTwo = new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(
						`**♪ | Now playing:** [${ song.title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Queued Tracks**\n${ pages[page] }`,
					)
					.addFields(
						{
							name: "Track Duration",
							value: song.isStream
								? `\`LIVE\``
								: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
									player.queue.current.duration,
									{ colonNotation: true },
								) }\``,
							inline: true,
						},
						{
							name: "Total Tracks Duration",
							value: `\`${ pms(queueDuration, {
								colonNotation: true,
							}) }\``,
							inline: true,
						},
						{
							name: "Total Tracks",
							value: `\`${ player.queue.totalSize - 1 }\``,
							colonNotation: true,
							inline: true,
						},
					)
					.setFooter({
						text: `Page ${ page + 1 }/${ pages.length }`,
					});
				
				await interaction
					.editReply({
						embeds: [embedTwo],
					})
					.catch(() => {
					});
			} else {
				let song = player.queue.current;
				const embedThree = new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(
						`**♪ | Now playing:** [${ song.title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Queued Tracks**\n${ pages[page] }`,
					)
					.addFields(
						{
							name: "Track Duration",
							value: song.isStream
								? `\`LIVE\``
								: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
									player.queue.current.duration,
									{ colonNotation: true },
								) }\``,
							inline: true,
						},
						{
							name: "Total Tracks Duration",
							value: `\`${ pms(queueDuration, {
								colonNotation: true,
							}) }\``,
							inline: true,
						},
						{
							name: "Total Tracks",
							value: `\`${ player.queue.totalSize - 1 }\``,
							colonNotation: true,
							inline: true,
						},
					)
					.setFooter({
						text: `Page ${ page + 1 }/${ pages.length }`,
					});
				
				const buttonOne = new ButtonBuilder()
					.setCustomId("queue_cmd_but_1_app")
					.setEmoji("⏭️")
					.setStyle("PRIMARY");
				const buttonTwo = new ButtonBuilder()
					.setCustomId("queue_cmd_but_2_app")
					.setEmoji("⏮️")
					.setStyle("PRIMARY");
				
				await interaction
					.editReply({
						embeds: [embedThree],
						components: [
							new ActionRowBuilder().addComponents([buttonTwo, buttonOne]),
						],
					})
					.catch(() => {
					});
				
				const collector = interaction.channel.createMessageComponentCollector({
					filter: (b) => {
						if (b.user.id === interaction.user.id) {
							return true;
						} else {
							return b
								.reply({
									content: `Only **${ interaction.user.tag }** can use this button.`,
									ephemeral: true,
								})
								.catch(() => {
								});
						}
					},
					time: 60000 * 5,
					idle: 30e3,
				});
				
				collector.on("collect", async (button) => {
					if (button.customId === "queue_cmd_but_1_app") {
						await button.deferUpdate().catch(() => {
						});
						page = page + 1 < pages.length? ++page : 0;
						
						const embedFour = new EmbedBuilder()
							.setColor(client.config.embedColor)
							.setDescription(
								`**♪ | Now playing:** [${ song.title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Queued Tracks**\n${ pages[page] }`,
							)
							.addFields(
								{
									name: "Track Duration",
									value: song.isStream
										? `\`LIVE\``
										: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
											player.queue.current.duration,
											{ colonNotation: true },
										) }\``,
									inline: true,
								},
								{
									name: "Total Tracks Duration",
									value: `\`${ pms(queueDuration, {
										colonNotation: true,
									}) }\``,
									inline: true,
								},
								{
									name: "Total Tracks",
									value: `\`${ player.queue.totalSize - 1 }\``,
									colonNotation: true,
									inline: true,
								},
							)
							.setFooter({
								text: `Page ${ page + 1 }/${ pages.length }`,
							});
						
						await interaction.editReply({
							embeds: [embedFour],
							components: [
								new ActionRowBuilder().addComponents([buttonTwo, buttonOne]),
							],
						});
					} else if (button.customId === "queue_cmd_but_2_app") {
						await button.deferUpdate().catch(() => {
						});
						page = page > 0? --page : pages.length - 1;
						
						const embedFive = new EmbedBuilder()
							.setColor(client.config.embedColor)
							.setDescription(
								`**♪ | Now playing:** [${ song.title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Queued Tracks**\n${ pages[page] }`,
							)
							.addFields(
								{
									name: "Track Duration",
									value: song.isStream
										? `\`LIVE\``
										: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
											player.queue.current.duration,
											{ colonNotation: true },
										) }\``,
									inline: true,
								},
								{
									name: "Total Tracks Duration",
									value: `\`${ pms(queueDuration, {
										colonNotation: true,
									}) }\``,
									inline: true,
								},
								{
									name: "Total Tracks",
									value: `\`${ player.queue.totalSize - 1 }\``,
									colonNotation: true,
									inline: true,
								},
							)
							.setFooter({
								text: `Page ${ page + 1 }/${ pages.length }`,
							});
						
						await interaction
							.editReply({
								embeds: [embedFive],
								components: [
									new ActionRowBuilder().addComponents([buttonTwo, buttonOne]),
								],
							})
							.catch(() => {
							});
					} else {
						return;
					}
				});
			}
		}
	});

module.exports = command;
