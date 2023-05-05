import * as fs from "fs/promises";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

import { chunkString } from "./util";

const maxInputLength = 1500;
const maxSummaryLength = 300;
const maxRecursion = 10; // 念のため

function summaryPrompt(text: string): string {
    return `あなたは編集者です。以下の文章を元にインタビューされた人の詳細を200字程度で要約してください。\n\n${text}`;
}

interface Config {
    debug: boolean;
}

function sleep(ms: number){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function summaryLongTextApp(file: string, { debug }: Config): Promise<void> {
    const rawText = await fs.readFile(file, "utf-8");
    const summaryText = await getSummary(rawText, debug);
    console.log(`# Final summary\n${summaryText}`);
}

async function getSummary(text: string, debug: boolean, level: number = 1): Promise<string> {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    // 再帰的要約
    if (text.length <= maxSummaryLength || level > maxRecursion) {
        return text;
    }

    const textChunks = chunkString(text, maxInputLength);
    const summaryChunks = await Promise.all(textChunks.map(
      async (chunk, index) => {
        await sleep(1000*index);
        const messages: ChatCompletionRequestMessage[] = [
          {role: "user", content: summaryPrompt(chunk)}
        ]
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: summaryPrompt(chunk),
          max_tokens: maxSummaryLength,
          temperature: 0,
        });
        const chunkSummary = completion.data.choices[0].text || "";
        if (debug) {
          console.log(`# Summary level ${level}, chunk ${index}\n${chunkSummary}\n\n`);
        }
        return chunkSummary;
      }
    ));
    const joinedSummary = summaryChunks.join("\n");
    if (debug) {
        console.log(`# Summary level ${level}\n${joinedSummary}\n\n`);
    }
    return getSummary(joinedSummary, debug, level + 1);
}
