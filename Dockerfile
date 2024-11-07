FROM node:14.17.3
COPY package.json .
RUN npm install -g @angular/cli
RUN npm install -g typescript@4.1.6
RUN npm install -g @ionic/cli
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm run build
CMD ["node", "server.js"]
EXPOSE 4200 8080
