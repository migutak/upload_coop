FROM node:12.9.1-alpine

RUN mkdir -p /app/nfs/demandletters && \
    chown node:node -R /app/nfs/demandletters && \
    mkdir -p /app/nfs/uploads && \
    chown node:node -R /app/nfs/uploads
WORKDIR /home/node/uploads

COPY package*.json ./
RUN npm install --production

# Bundle app source code
COPY --chown=node . .

# && usermod -aG sudo node
USER node
EXPOSE 4000
EXPOSE 3000

CMD ["npm" , "start"]

# docker build -t migutak/uploads:5.0 .
