FROM node:18.16.0

ENV APP_ROOT=/app

RUN apt update -y && apt install -y vim

RUN apt install -y jq ffmpeg

WORKDIR ${APP_ROOT}