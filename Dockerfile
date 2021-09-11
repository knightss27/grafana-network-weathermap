FROM node:14
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
