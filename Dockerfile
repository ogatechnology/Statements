FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY microservice .
EXPOSE 3000
CMD [ "npm", "start" ]