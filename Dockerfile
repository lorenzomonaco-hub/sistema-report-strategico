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
RUN npm install -g serve@14
COPY --from=build /app/out ./out
EXPOSE 8000
CMD ["sh", "-c", "serve out -l ${PORT:-8000} -n"]
