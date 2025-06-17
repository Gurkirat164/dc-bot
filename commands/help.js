import { EmbedBuilder } from 'discord.js';

let prefixRef = { value: '!' };

export function setPrefixRef(ref) {
  prefixRef = ref;
}

export default {
  name: 'help',
  async execute(message, args) {
    // Get all command names from the client
    const commandNames = Array.from(message.client.commands.keys());

    const embed = new EmbedBuilder()
      .setTitle('Bot Help')
      .setDescription(`**Current Prefix:** \`${prefixRef.value}\``)
      .addFields([
        {
          name: 'Commands',
          value: commandNames.map(cmd => `\`${cmd}\``).join(' '),
        }
      ])
      .setColor(0x5865F2);

    await message.reply({ embeds: [embed] });
  }
};
