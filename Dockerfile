FROM node:12.9.1-alpine
RUN mkdir -p /app/nfs/demandletters && chown node:node -R /app/nfs/demandletters
WORKDIR /home/node/uploads
COPY . /home/node/uploads
RUN npm install --production
# && usermod -aG sudo node
USER node


#RUN mkdir -p /home/node/nfs/uploads
#RUN mkdir -p /home/node/nfs/demandletters

CMD ["npm" , "start"]

EXPOSE 4000
EXPOSE 3000
EXPOSE 5001
EXPOSE 5000

# docker build -t 52.117.54.217:5000/uploads:1.0.0 .
