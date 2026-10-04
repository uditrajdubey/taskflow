FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
