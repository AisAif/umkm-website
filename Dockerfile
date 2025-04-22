FROM node:20.12.2-alpine3.18 AS base

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm install

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .

RUN cp ./assets/rasa_config_default.template.ts ./assets/rasa_config_default.ts

RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE ${PORT}
CMD ["node", "./bin/server.js"]
