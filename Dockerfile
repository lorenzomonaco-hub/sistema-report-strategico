# Piattaforma Sistema Report Strategico — build statica servita su Railway.
# (Su GitHub Pages la stessa build gira con GITHUB_PAGES=true e basePath;
#  qui il sito è servito alla radice del dominio, senza basePath.)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/out ./out
COPY server.mjs .
EXPOSE 8000
CMD ["node", "server.mjs"]
