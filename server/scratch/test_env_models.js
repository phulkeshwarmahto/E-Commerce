

const apiKey = "AIzaSyBv17GEix8XVbyo-gacTQx8Fv8E1oIApgc";
const models = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite"
];

async function test() {
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Say hello in one word" }] }]
          })
        }
      );
      console.log(`Model: ${model}, Status: ${response.status}`);
      const text = await response.text();
      console.log("Response:", text.substring(0, 300));
    } catch (err) {
      console.log(`Model: ${model} threw error:`, err.message);
    }
  }
}
test();
