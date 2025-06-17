import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default {
  name: 'dmall',
  async execute(message, args) {
    if (!message.member?.permissions?.has?.('Administrator')) {
      return message.reply('You need Administrator permission to use this command.');
    }
    if (args.length < 2) {
      return message.reply('Usage: dmall <cooldown_minutes> <message>');
    }
    const cooldownMinutes = parseFloat(args[0]);
    if (isNaN(cooldownMinutes) || cooldownMinutes < 0) {
      return message.reply('Please provide a valid cooldown in minutes (0 or greater).');
    }
    const dmText = args.slice(1).join(' ');
    if (!dmText) {
      return message.reply('Please provide a message to send.');
    }
    const guild = message.guild;
    if (!guild) {
      return message.reply('This command can only be used in a server.');
    }

    let sent = 0, failed = 0;
    try {
      await guild.members.fetch();
    } catch (err) {
      console.log('[dmall] Failed to fetch members:', err);
      return message.reply('Failed to fetch server members.');
    }

    // Fix for __dirname in ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dmedFile = path.join(__dirname, '..', 'dmall_dmed_users.txt');
    const progressFile = path.join(__dirname, '..', 'dmall_progress.json');

    // Helper to read all DMed user IDs into a Set
    function getDmedSet() {
      if (!fs.existsSync(dmedFile)) return new Set();
      return new Set(fs.readFileSync(dmedFile, 'utf8').split('\n').map(x => x.trim()).filter(Boolean));
    }

    // Helper to append user ID to file (only on success)
    function markDmed(userId) {
      fs.appendFileSync(dmedFile, `${userId}\n`);
    }

    // Helper to log progress to a file
    function logProgress(sent, failed, total) {
      const progressData = {
        sent,
        failed,
        total,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(progressFile, JSON.stringify(progressData, null, 2));
    }

    const dmedSet = getDmedSet();

    // Only DM users who have not been DMed before
    const members = guild.members.cache
      .filter(member => !member.user.bot && member.id !== message.author.id && !dmedSet.has(member.id))
      .map(member => member);

    if (members.length === 0) {
      return message.reply('No members to DM.');
    }

    console.log(`[dmall] Starting DM process in guild "${guild.name}" (${guild.id})`);
    console.log(`[dmall] Total members to DM: ${members.length}`);
    console.log(`[dmall] Cooldown: ${cooldownMinutes} minute(s)`);
    console.log(`[dmall] Message: ${dmText}`);

    let progressMsg;
    try {
      progressMsg = await message.reply(`Starting DM process...\nSent: 0/${members.length} | Failed: 0 | Cooldown: ${cooldownMinutes} min`);
    } catch (err) {
      console.log('[dmall] Could not send progress message:', err);
      return message.reply('Could not send progress message.');
    }

    for (let i = 0; i < members.length; i++) {
      try {
        await members[i].send(dmText);
        sent++;
        // Store user ID in file ONLY if DM was sent successfully
        markDmed(members[i].id);
        console.log(`[dmall] DM sent to ${members[i].user.tag} (${members[i].id}) [${sent}/${members.length}]`);
      } catch (err) {
        failed++;
        // Do NOT log failed user IDs to file
        console.log(`[dmall] Failed to DM a member [${failed} failed]`, err);
      }
      // Log progress after each DM attempt
      logProgress(sent, failed, members.length);
      try {
        await progressMsg.edit(`Progress: Sent: ${sent}/${members.length} | Failed: ${failed} | Cooldown: ${cooldownMinutes} min`);
      } catch (err) {
        console.log('[dmall] Could not update progress message, trying to resend:', err);
        try {
          progressMsg = await message.reply(`Progress: Sent: ${sent}/${members.length} | Failed: ${failed} | Cooldown: ${cooldownMinutes} min`);
        } catch (err2) {
          console.log('[dmall] Could not resend progress message:', err2);
        }
      }
      if (i < members.length - 1 && cooldownMinutes > 0) {
        console.log(`[dmall] Waiting ${cooldownMinutes} minute(s) before next DM...`);
        await new Promise(res => setTimeout(res, cooldownMinutes * 60 * 1000));
      }
    }

    // Log final progress as well
    logProgress(sent, failed, members.length);

    try {
      await progressMsg.edit(`✅ All DMs sent!\nFinal Report: Sent: ${sent}/${members.length} | Failed: ${failed}`);
      await message.reply('DM process completed!');
    } catch (err) {
      console.log('[dmall] Could not send completion message, trying to resend:', err);
      try {
        await message.reply(`✅ All DMs sent!\nFinal Report: Sent: ${sent}/${members.length} | Failed: ${failed}`);
      } catch (err2) {
        console.log('[dmall] Could not resend completion message:', err2);
      }
    }
    console.log(`[dmall] DM process completed. Sent: ${sent}, Failed: ${failed}`);
  }
};
