export default {
  async fetch(request, env) {
    // Always respond 200 to Telegram, never 500
    try {
      if (request.method !== "POST") return new Response("OK", { status: 200 });

      const update = await request.json();

      const msg =
        update.message ||
        update.edited_message ||
        update.channel_post ||
        update.edited_channel_post;

      if (!msg) return new Response("No message", { status: 200 });

      const chat = msg.chat;
      const msgId = msg.message_id;

      // Must be public group/channel (username needed)
      if (!chat.username) return new Response("Private group", { status: 200 });

      const postLink = `https://t.me/${chat.username}/${msgId}`;
      const text = `🔗 Open original post:\n${postLink}`;

      // If token missing, don't crash
      if (!env.BOT_TOKEN) return new Response("Missing BOT_TOKEN", { status: 200 });

      const telegramURL = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

      await fetch(telegramURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat.id, text })
      });

      return new Response("Sent", { status: 200 });
    } catch (e) {
      // Never return 500 to Telegram
      return new Response("OK", { status: 200 });
    }
  }
};
