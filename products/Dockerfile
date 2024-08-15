FROM node:latest

# Default value; will be overridden by build_args, if passed
ARG node_env=production
ARG debug=''
ARG github_mode=''

ENV NODE_ENV $node_env
ENV DEBUG $debug
ENV GITHUB_MODE $github_mode

WORKDIR /app

ADD . .

RUN yarn install

ENV PATH="$PATH:/app/node_modules/typescript/bin"

RUN bash -c '[[ -n $GITHUB_MODE ]] && yarn test' || echo Skipping tests

ENTRYPOINT [ "npx", "nodemon", "./app.ts" ]
