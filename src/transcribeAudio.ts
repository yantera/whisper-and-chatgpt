import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudioApp(dirName: string, maxFileCount: number): Promise<void> {
  const stream = fs.createWriteStream(`texts/origin/${dirName}.txt`);
  const openai = new OpenAIApi(configuration);

  for (let i = 1; i <= maxFileCount; i++) {
    const resp = await openai.createTranscription(
      fs.createReadStream(`voices/outputs/${dirName}/output_${i}.mp3`) as any,
      "whisper-1",
      undefined,
      "text"
    );
    console.log(resp.data);
    stream.write(resp.data);
  }
  stream.end("\n");
  // エラー処理
  stream.on("error", (err: Error) => {
    if (err) console.log(err.message);
  });
}
