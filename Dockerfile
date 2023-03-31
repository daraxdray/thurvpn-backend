FROM node:16

# Create app directory
WORKDIR /app

COPY package*.json ./

#Building App
RUN npm install
RUN npm install moment

COPY . .

#Assigning the specified port
EXPOSE 3000

#Starting app
CMD ["npm", "start"]