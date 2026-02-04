export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") return new Response("OK", { status: 200 });

      let update;
      try {
        update = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 200 });
      }

      const msg =
        update.message ||
        update.edited_message ||
        update.channel_post ||
        update.edited_channel_post;

      if (!msg || !msg.chat) return new Response("No message", { status: 200 });

      const chat = msg.chat;

      // Only PUBLIC groups/channels (must have username)
      if (!chat.username) return new Response("Private group", { status: 200 });

      if (!env.BOT_TOKEN) return new Response("Missing BOT_TOKEN", { status: 200 });

      const postLink = `https://t.me/${chat.username}/${msg.message_id}`;

      // 1) Send a small bot message (NO reply, NO preview card)
      const sendRes = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat.id,
            text: `🔗 Open original post:\n${postLink}`,
            disable_web_page_preview: true
          })
        }
      );

      const sendData = await sendRes.json();

      // If send failed, stop (but still return 200 to Telegram)
      if (!sendData.ok) return new Response("OK", { status: 200 });

      const botMessageId = sendData.result.message_id;

      // 2) Edit the bot's own message (example: add extra line / style)
      const editedText = `🔗 Open original post:\n${postLink}\n\n✅ Tap the link to open`;

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          message_id: botMessageId,
          text: editedText,
          disable_web_page_preview: true
        })
      });

      return new Response("OK", { status: 200 });
    } catch (e) {
      return new Response("OK", { status: 200 });
    }
  }
};
