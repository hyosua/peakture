# client/Dockerfile
FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./
COPY vite.config.js ./

RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 5173