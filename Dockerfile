FROM node:fermium-alpine3.16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

#Building App
RUN npm install
RUN npm install moment

COPY . /usr/src/app

#Assigning the specified port
EXPOSE 2023

#Starting app
CMD ["npm", "start"]