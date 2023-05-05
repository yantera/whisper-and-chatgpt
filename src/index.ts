#!/usr/bin/env node
import { Command } from "commander";
import { summaryLongTextApp } from "./summaryLongText";
import { transcribeAudioApp } from "./transcribeAudio";
import { splitVoiceMemoApp } from "./splitVoiceMemo";

function main() {
  const program = new Command();
  program
    .description("Learn ChatGPT API By Example");
  program
    .command("split-voice-memo <inputFileName> <outputDirName>")
    .action(async(inputFileName, outputDirName) => {
      await splitVoiceMemoApp(inputFileName, outputDirName);
    });
  program
    .command("transcribe-audio <dirName> <maxFileCount>")
    .description("transcribe audio files")
    .action(async(dirName, maxFileCount) => {
      await transcribeAudioApp(dirName, maxFileCount);
    });
  program
    .command("summary-long-text <file>")
    .description("summarize a long text file")
    .option("-d, --debug", "debug mode", false)
    .action(async (file, options) => {
      await summaryLongTextApp(file, { debug: options.debug });
    });
  program.parse(process.argv);
}

main();
