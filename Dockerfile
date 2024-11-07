FROM node:18.20.4 as build
COPY package.json .
RUN npm install -g typescript@4.4.4
RUN npm install -g @ionic/cli
RUN npm install --legacy-peer-deps
RUN ng update @angular/core
RUN ng update @angular/cli
COPY . ./
RUN npm run build
CMD ["node", "server.js"]
EXPOSE 4200 8080
