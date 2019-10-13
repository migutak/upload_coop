FROM node:10.16.3-alpine
WORKDIR /app
COPY . /app

CMD node index.js && node xls_uploads.js && node activity_file_upload.js && node demands_uploads.js

EXPOSE 4000
EXPOSE 3000
EXPOSE 5001
EXPOSE 5000