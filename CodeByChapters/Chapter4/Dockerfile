# Use the official Node.js 24 LTS image as the base image
FROM node:24-bookworm-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app's dependencies
RUN npm ci

# Copy the rest of the app's source code to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]

#build it with this command:
#docker build -t simpleawsnodejsapp .

#run it with this command:
#docker run -p 3000:3000 simpleawsnodejsapp
