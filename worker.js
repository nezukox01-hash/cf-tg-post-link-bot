export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return new Response("OK", { status: 200 });
      }

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

      if (!msg || !msg.chat) {
        return new Response("No message", { status: 200 });
      }

      const chat = msg.chat;

      // Only PUBLIC groups/channels (must have username)
      if (!chat.username) {
        return new Response("Private group", { status: 200 });
      }

      if (!env.BOT_TOKEN) {
        return new Response("Missing BOT_TOKEN", { status: 200 });
      }

      const postLink = `https://t.me/${chat.username}/${msg.message_id}`;

      // --- Secret/Spoiler text ---
      const secretText = "Secret text"; // <- hrere secret version 
      const text = `🔗 Open original post:\n${postLink}\n\n${secretText}`;

      // Telegram spoiler entity needs offset+length (UTF-16 code units)
      const offset = text.length - secretText.length;
      const entities = [{ type: "spoiler", offset, length: secretText.length }];

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          text,
          entities,
          disable_web_page_preview: true // ✅ card view off
        })
      });

      return new Response("OK", { status: 200 });
    } catch (e) {
      // Never return 500 to Telegram
      return new Response("OK", { status: 200 });
    }
  }
};
