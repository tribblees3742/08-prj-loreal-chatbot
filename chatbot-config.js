// Central place to adjust the chatbot behavior.
// This project uses a class-hosted Cloudflare Worker, so no API key is needed.
 const chatbotConfig = {
   workerUrl: "https://fragrant-cell-7793.tribblees3742.workers.dev/",
   model: "gpt-4.1",
   welcomeMessage:
    "✨ Welcome to the L'Oréal Recruiter Studio. Ask me about careers, confidence, growth, or how to answer a reflective question with impact.",
   refusalMessage:
     "I can only support reflective questions related to L'Oréal, careers, professional growth, and workplace confidence.",
   supportMessage:
    "I can help you shape a thoughtful response for L'Oréal-style career, leadership, or reflective interview questions.",
 };
