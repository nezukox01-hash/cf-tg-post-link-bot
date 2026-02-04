export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("OK");
    }

    const msg =
      update.message ||
      update.edited_message ||
      update.channel_post ||
      update.edited_channel_post;

    if (!msg || !msg.chat || !msg.chat.username) return new Response("OK");
    if (!env.BOT_TOKEN) return new Response("OK");

    const chat = msg.chat;
    const postLink = `https://t.me/${chat.username}/${msg.message_id}`;

    // Step 1: send simple message
    const sendRes = await fetch(
      `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          text: "🔗 Open original post:\n" + postLink,
          disable_web_page_preview: true
        })
      }
    );

    const sendData = await sendRes.json();
    if (!sendData.ok) return new Response("OK");

    const botMsgId = sendData.result.message_id;

    // Step 2: edit and HIDE ONLY THE LINK
    const visibleText = "🔗 Open original post:\n";
    const fullText = visibleText + postLink;

    await fetch(
      `https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          message_id: botMsgId,
          text: fullText,
          disable_web_page_preview: true,
          entities: [
            {
              type: "spoiler",
              offset: visibleText.length,
              length: postLink.length
            }
          ]
        })
      }
    );

    return new Response("OK");
  }
};
