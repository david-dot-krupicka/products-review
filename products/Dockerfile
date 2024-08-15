FROM node:latest

# Default value; will be overridden by build_args, if passed
ARG node_env=production
ARG debug=''

ENV NODE_ENV $node_env
ENV DEBUG $debug

WORKDIR /app

ADD src .

ADD .env .env
ADD package.json package.json
ADD tsconfig.json tsconfig.json
ADD eslint.config.mjs eslint.config.mjs
ADD yarn.lock yarn.lock

RUN yarn install

ENV PATH="$PATH:/app/node_modules/typescript/bin"

ENTRYPOINT [ "npx", "nodemon", "./app.ts" ]
