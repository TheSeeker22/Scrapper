FROM node:20-alpine
WORKDIR /app
COPY package.json ./
# RUN npm ci
COPY . .
EXPOSE 8000
CMD [ "tail", "-f","/dev/null" ]