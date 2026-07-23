/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

let conversationHistory = [];

function addMessage(text, sender) {
  const messageClass = sender === "user" ? "msg user" : "msg ai";
  chatWindow.innerHTML += `<div class="${messageClass}">${text}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function isRelevantTopic(userText) {
  const lowerText = userText.toLowerCase();
  const mentionsLoreal = /(l['’]?oréal|loreal|loreal paris)/i.test(userText);
  const beautyTopic =
    /(beauty|beauty product|beauty routine|routine|skincare|makeup|haircare|hair|serum|moisturizer|cleanser|foundation|mascara|eyeshadow|lipstick|lip|blush|shampoo|conditioner|skin)/i.test(
      lowerText,
    );

  return mentionsLoreal || beautyTopic;
}

function getLocalReply(userText) {
  const lowerText = userText.toLowerCase();

  if (/(skincare|serum|moisturizer|cleanser|skin)/i.test(lowerText)) {
    return "For a simple L'Oréal skincare routine, start with a gentle cleanser, add a hydrating serum, and finish with a moisturizer for a fresh glow.";
  }

  if (
    /(makeup|foundation|lip|lipstick|mascara|blush|eyeshadow)/i.test(lowerText)
  ) {
    return "For a polished L'Oréal makeup look, try a lightweight foundation, a soft blush, and a satin lip color for everyday elegance.";
  }

  if (/(hair|shampoo|conditioner|haircare)/i.test(lowerText)) {
    return "For healthy-looking hair, pair a nourishing shampoo with a conditioner from the L'Oréal Elvive range for smooth, shiny results.";
  }

  return chatbotConfig.supportMessage;
}

async function sendToWorker(userText) {
  const messages = [
    ...conversationHistory,
    { role: "user", content: userText },
  ];

  const response = await fetch(chatbotConfig.workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: chatbotConfig.model,
      messages: messages,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "The worker could not answer right now.");
  }

  return data.choices?.[0]?.message?.content || getLocalReply(userText);
}

// Set initial message
addMessage(chatbotConfig.welcomeMessage, "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();

  if (!userText) {
    return;
  }

  addMessage(userText, "user");
  conversationHistory.push({ role: "user", content: userText });
  userInput.value = "";

  if (!isRelevantTopic(userText)) {
    const refusalReply = chatbotConfig.refusalMessage;
    addMessage(refusalReply, "ai");
    conversationHistory.push({ role: "assistant", content: refusalReply });
    return;
  }

  try {
    const reply = await sendToWorker(userText);
    addMessage(reply, "ai");
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    addMessage(
      "The beauty assistant is unavailable right now. Please try again in a moment.",
      "ai",
    );
  }
});
