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

      // Only edit text messages (photos/captions can be added later if you want)
      if (!msg.text) return new Response("Not a text message", { status: 200 });

      const postLink = `https://t.me/${chat.username}/${msg.message_id}`;

      // New edited message text
      const newText =
        msg.text +
        "\n\n🔗 Open original post: " +
        postLink;

      // Edit the ORIGINAL message (no reply preview)
      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          message_id: msg.message_id,
          text: newText,
          disable_web_page_preview: true
        })
      });

      return new Response("OK", { status: 200 });
    } catch (e) {
      return new Response("OK", { status: 200 });
    }
  }
};
