FROM node:11-alpine

WORKDIR /usr/server

COPY ./package.json ./

RUN npm install

COPY ./nodemon.json ./
COPY ./tsconfig.json ./
COPY ./build/ormconfig.js ./
COPY ./build/ormconfig.js.map ./

COPY ./build/src ./src

CMD ["npm", "run", "prod"]