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

    const members = guild.members.cache
      .filter(member => !member.user.bot && member.id !== message.author.id)
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
        console.log(`[dmall] DM sent to ${members[i].user.tag} (${members[i].id}) [${sent}/${members.length}]`);
      } catch (err) {
        failed++;
        console.log(`[dmall] Failed to DM ${members[i].user.tag} (${members[i].id}) [${failed} failed]`, err);
      }
      try {
        await progressMsg.edit(`Progress: Sent: ${sent}/${members.length} | Failed: ${failed} | Cooldown: ${cooldownMinutes} min`);
      } catch (err) {
        console.log('[dmall] Could not update progress message:', err);
      }
      if (i < members.length - 1 && cooldownMinutes > 0) {
        console.log(`[dmall] Waiting ${cooldownMinutes} minute(s) before next DM...`);
        await new Promise(res => setTimeout(res, cooldownMinutes * 60 * 1000));
      }
    }

    try {
      await progressMsg.edit(`✅ All DMs sent!\nFinal Report: Sent: ${sent}/${members.length} | Failed: ${failed}`);
      await message.reply('DM process completed!');
    } catch (err) {
      console.log('[dmall] Could not send completion message:', err);
    }
    console.log(`[dmall] DM process completed. Sent: ${sent}, Failed: ${failed}`);
  }
};
