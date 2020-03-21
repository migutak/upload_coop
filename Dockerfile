FROM node:10.16.3-alpine
WORKDIR /app/uploads
COPY . /app/uploads
RUN mkdir -p /app/nfs/uploads
RUN mkdir -p /app/nfs/demandletters

CMD ["npm" , "start"]

EXPOSE 4000
EXPOSE 3000
EXPOSE 5001
EXPOSE 5000

# docker build -t 52.117.54.217:5000/uploads:1.0.0 .
