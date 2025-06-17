import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const prefixRef = { value: '!' }; // Use an object so it can be updated by reference

client.commands = new Collection();

// Dynamically import all command files
const commandsPath = path.join(process.cwd(), 'dc-bot', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`./commands/${file}`);
  // Special handling for setprefix and help to inject prefixRef
  if (commandModule.setPrefixRef) commandModule.setPrefixRef(prefixRef);
  client.commands.set(commandModule.default.name, commandModule.default);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefixRef.value)) return;

  const args = message.content.slice(prefixRef.value.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  const command = client.commands.get(commandName);
  if (command) {
    command.execute(message, args);
  }
});

client.login(process.env.DISCORD_TOKEN);
