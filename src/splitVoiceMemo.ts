import { exec } from "child_process";
import * as fs from "fs";
import path from "path";

// ffmpegコマンドを実行する関数
function runFFmpegCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// 入力ファイルをmp3に変換する関数
function convertToMp3(inputFile: string): Promise<string> {
  const mp3InputFile: string = path.join(path.dirname(inputFile), `${path.basename(inputFile, path.extname(inputFile))}.mp3`);
  const command: string = `ffmpeg -i ${inputFile} -acodec libmp3lame -q:a 2 "${mp3InputFile}"`;
  console.log('Created mp3');
  return runFFmpegCommand(command).then(() => mp3InputFile);
}

// 入力ファイルの長さを取得する関数
function getInputFileDuration(mp3InputFile: string): Promise<number> {
  const command: string = `ffprobe -i "${mp3InputFile}" -show_entries format=duration -v quiet -of json | jq -r '.format.duration | tonumber'`;
  return runFFmpegCommand(command).then(output => {
    const duration: number = parseFloat(output);

    if (isNaN(duration)) {
      throw new Error('Invalid duration: ' + output);
    }

    return duration;
  });
}

async function splitMp3File(mp3File: string, dirName: string): Promise<void> {
  try {
    // 分割する時間間隔（秒単位）
    const interval: number = 600; // 10分 = 10 * 60秒

    // 出力ファイル名のプレフィックス
    const outputFilePrefix: string = "output_";
    const outputDirPath: string = `/app/voices/outputs/${dirName}`;

    // 変換したmp3ファイルの大きさを取得
    const duration: number = await getInputFileDuration(mp3File);

    // 分割する回数を計算する
    const numSegments: number = Math.ceil(duration / interval);

    // ディレクトリの作成
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath);
    }

    // 分割するコマンドを生成して実行する
    for (let i = 1; i <= numSegments; i++) {
      const start: number = (i - 1) * interval;
      const end: number = Math.min(i * interval, duration);
      const outputFile: string = `${outputDirPath}/${outputFilePrefix}${i}.mp3`;
      const command: string = `ffmpeg -i "${mp3File}" -ss ${start} -to ${end} -c copy "${outputFile}"`;
      console.log(`Splitting segment ${i} (${start} - ${end}) to ${outputFile}`);
      await runFFmpegCommand(command);
    }
  } catch (error) {
    console.error(error);
  }
}

async function removeMp3File(mp3File: string): Promise<void> {
  try {
    console.log('Removing mp3');
    const removeMp3FileCommand: string = `rm -f "${mp3File}"`;
    await runFFmpegCommand(removeMp3FileCommand);
  } catch (error) {
    console.error(error);
  }
}

export async function splitVoiceMemoApp(inputFileName: string, dirName: string): Promise<void> {
  try {
    // 入力ファイルをmp3に変換する
    const originFile: string = `/app/voices/origin/${inputFileName}`;
    const mp3File: string = await convertToMp3(originFile);

    // mp3をファイル分割する
    await splitMp3File(mp3File, dirName);

    // 作成したmp3を削除
    await removeMp3File(mp3File);
  } catch (error) {
    console.error(error);
  }
}

