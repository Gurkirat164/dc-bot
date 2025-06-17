let prefixRef = { value: '!' };

export function setPrefixRef(ref) {
  prefixRef = ref;
}

export default {
  name: 'setprefix',
  execute(message, args) {
    if (!args[0]) {
      message.reply('Please provide a new prefix.');
      return;
    }
    prefixRef.value = args[0];
    message.reply(`Prefix changed to \`${prefixRef.value}\``);
  }
};
