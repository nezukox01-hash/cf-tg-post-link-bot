addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response("OK");
  }

  const update = await request.json();
  if (!update.message) {
    return new Response("No message");
  }

  const chat = update.message.chat;
  const msgId = update.message.message_id;

  // Only public groups (must have username)
  if (!chat.username) {
    return new Response("Private group – no public link");
  }

  const postLink = `https://t.me/${chat.username}/${msgId}`;
  const text = `🔗 Open original post:\n${postLink}`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat.id,
      text: text
    })
  });

  return new Response("Sent");
}
