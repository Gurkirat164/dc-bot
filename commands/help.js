import { setPrefixRef } from 'path_to_setPrefixRef';

setPrefixRef({ value: '!' });

export default {
  name: 'help',
  async execute(message, args) {
    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('Bot Commands Help')
      .setColor(0x5865F2)
      .addFields(
        {
          name: '!dmall <cooldown_minutes> <message>',
          value: [
            'Sends a DM to every member in the server (admin only).',
            'Skips users who have already been DMed.',
            'Cooldown is the wait time (in minutes) between each DM.',
            'Progress is tracked and logged in a file.',
            'Example: `!dmall 1 Hello, this is a test message!`'
          ].join('\n')
        },
        {
          name: '!help',
          value: [
            'Shows this help message.',
            'Example: `!help`'
          ].join('\n')
        }
      )
      .setFooter({ text: 'Use commands as shown above. <> = required, [] = optional.' });

    await message.reply({ embeds: [embed] });
  }
};
          name: '!reload',
          value: [
            'Reloads all bot commands without restarting the bot (admin only).',
            'Example: `!reload`'
          ].join('\n')
        },
        {
          name: '!help',
          value: [
            'Shows this help message.',
            'Example: `!help`'
          ].join('\n')
        }
      )
      .setFooter({ text: 'Use commands as shown above. <> = required, [] = optional.' });

    await message.reply({ embeds: [embed] });
  }
};
