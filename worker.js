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

      // Only PUBLIC groups
      if (!chat.username) {
        return new Response("Private group", { status: 200 });
      }

      if (!env.BOT_TOKEN) {
        return new Response("Missing BOT_TOKEN", { status: 200 });
      }

      const postLink = `https://t.me/${chat.username}/${msg.message_id}`;

      // Text where ONLY the link is hidden
      const visibleText = "🔗 Open original post\n";
      const text = visibleText + postLink;

      const entities = [
        {
          type: "spoiler",
          offset: visibleText.length,
          length: postLink.length
        }
      ];

      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          text,
          entities,
          disable_web_page_preview: true,
          reply_to_message_id: msg.message_id
        })
      });

      return new Response("OK", { status: 200 });

    } catch (e) {
      return new Response("OK", { status: 200 });
    }
  }
};
