# whisper-and-chatgpt
## SetUp
1. Set to OPENAI_API_KEY and OPENAI_API_ORGANIZATION_ID to .env
2. Run above commands
```bash
docker-compose build --no-cache
docker-compose up -d
docker-compose exec node npm install
docker-compose exec node npm run build
```

## Usage
#### splitVoiceMemo
1. Put input file to `voice/origin` directory
2. Run above command
```bash
docker-compose exec node npx ts-node src/index.ts split-voice-memo <inputFileName> <dirName>
```
3. Please check `voice/outputs` directory
Note: In the case of a 60-minute file, it will be divided into a maximum of 6 separate files.

#### transcribeAudio
1. Please run splitVoiceMemo before this command.
2. Run above command
```bash
docker-compose exec node npx ts-node src/index.ts transcribe-audio <dirName> <maxFileCount>
```
3. Please check `texts/origin` directory
Note:　If you have a 60-minute file that is divided into a maximum of 6 separate files, the maxFileCount will be set to 6.

#### summaryLongText
1. Please run splitVoiceMemo with transcribeAudio before this command.
2. Run above command
```bash
docker-compose exec node npx ts-node src/index.ts summary-long-text <texts/origin/dirName/file> > texts/outputs/<output.txt> --debug
```
3. Please check `texts/outputs` directory
Note: If you omit the --debug option, you will only be able to obtain the final result.

## Reference
[NewsPicks](https://github.com/newspicks/learn-chatgpt-api)

[OpenAI API](https://platform.openai.com/docs/api-reference)
