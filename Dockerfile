FROM node:18-alpine3.15

#RUN apt-get update && apt-get install -y vim iputils-ping
RUN mkdir -p /app/nfs/demandletters && mkdir -p  /home/ecollectadmin/templates && \
    mkdir -p  /home/ecollectadmin/demandletters &&\
    chown node:node -R /app/nfs/demandletters && \
    chown node:node -R /home/ecollectadmin/templates && \
    chown node:node -R /home/ecollectadmin/demandletters && \
    mkdir -p /app/nfs/uploads && \
    chown node:node -R /app/nfs/uploads
WORKDIR /home/node/uploads

COPY package*.json ./
COPY upload_notes.xlsx /home/ecollectadmin/templates
RUN npm install --production

# Bundle app source code
COPY --chown=node . .

# && usermod -aG sudo node
USER node

EXPOSE 3000

CMD ["node", "activity_file_upload.js"]

# docker build -t migutak/uploads:5.7 .
