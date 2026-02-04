export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") return new Response("OK");

      const update = await request.json();
      const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;

      if (!msg) return new Response("No message");

      const chat = msg.chat;
      const msgId = msg.message_id;

      // Public group/channel must have username
      if (!chat.username) return new Response("Private group – no public link");

      const postLink = `https://t.me/${chat.username}/${msgId}`;
      const text = `🔗 Open original post:\n${postLink}`;

      const telegramURL = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

      await fetch(telegramURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat.id, text })
      });

      return new Response("Sent");
    } catch (e) {
      // Telegram needs a valid response; returning 500 will keep retrying
      return new Response("Worker error", { status: 200 });
    }
  }
};
