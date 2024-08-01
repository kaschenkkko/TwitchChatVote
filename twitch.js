ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    message = message.replace("  "," ").replace(/[\uD800-\uDFFF]/gi, []).trim()
    messageHandler(user, message)
}
