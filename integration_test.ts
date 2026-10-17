import { generateAnswer } from "./lib/rag/llm";

(async () => {
  const question = "What is the star count for the TableFlow repository?";
  const chunks: unknown[] = [];
  try {
    const iterable = await generateAnswer(question, chunks);
    let answer = "";
    for await (const token of iterable) {
      answer += token;
    }
    console.log("ANSWER:\n", answer);
  } catch (e) {
    console.error("ERROR", e);
  }
})();
