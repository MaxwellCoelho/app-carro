FROM node
COPY package.json .
RUN npm install -g typescript@4.1.6
RUN npm install -g @ionic/cli
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm run build
CMD ["sh", "-c", "npm run start"]
EXPOSE 3001
