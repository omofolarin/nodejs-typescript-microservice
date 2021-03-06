FROM mhart/alpine-node:12

WORKDIR /usr/app/

COPY package*.json ./

RUN npm install

COPY . .

ENV MONGODB_URI_LOCAL="mongodb://mongo:27017/microservice-template"
ENV SESSION_SECRET="something funny"
RUN npm run build

EXPOSE 8080


CMD [ "npm", "start" ]