FROM node:18-alpine as base

WORKDIR /app
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install Playwright without dependencies (since we'll install them manually)
RUN yarn add playwright && npx playwright install chromium
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

RUN yarn build 


EXPOSE 8010

CMD ["yarn", "start"]

