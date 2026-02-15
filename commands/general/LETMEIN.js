module.exports = {
    name: "letmein",
    description: "LETMEINNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    aliases: ["pt"],
    execute: async (client, message, args) => {
        const sent = await message.reply(`https://tenor.com/view/let-me-in-kintsu-let-me-in-kinstu-liquid-staking-monad-staking-gif-15293478240314454385`).catch(() => {});
    }
}