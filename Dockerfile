FROM node:13-alpine
WORKDIR /usr/src/app
RUN apk add yarn busybox-initscripts
COPY . /usr/src/app
RUN yarn install
RUN echo "0 * * * * cd /usr/src/app/ && node cloudflare.js" >> /etc/crontabs/root
CMD rc-service crond start && rc-update add crond
