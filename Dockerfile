FROM node:12.9.1-alpine
RUN mkdir -p /app/nfs/demandletters && chown node:node -R /app/nfs/demandletters
WORKDIR /home/node/uploads

COPY package*.json ./
RUN npm install --production

# Bundle app source code
COPY --chown=node . .

# && usermod -aG sudo node
USER node


CMD ["npm" , "start"]

EXPOSE 4000
EXPOSE 3000

# docker build -t 52.117.54.217:5000/uploads:1.0.0 .
