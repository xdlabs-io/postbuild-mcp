FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY index.js tools-schema.js README.md LICENSE ./

ENTRYPOINT ["node", "index.js"]
