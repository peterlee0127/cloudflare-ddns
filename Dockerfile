FROM node:13-alpine
WORKDIR /usr/src/app
RUN apk add yarn
COPY . /usr/src/app
RUN yarn install
