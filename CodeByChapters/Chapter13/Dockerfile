# Use the official Node.js LTS image as the base image
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app's dependencies
RUN npm ci

# Copy the rest of the app's source code to the working directory
COPY . .

# Download and install the X-Ray daemon
RUN curl -o /tmp/aws-xray-daemon.zip https://s3.us-east-1.amazonaws.com/aws-xray-assets.us-east-1/xray-daemon/aws-xray-daemon-linux-3.x.zip && \
    unzip /tmp/aws-xray-daemon.zip -d /usr/local/bin/ && \
    rm /tmp/aws-xray-daemon.zip

# Copy an entrypoint script to run both the X-Ray daemon and your app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]

#build it with this command:
#docker build -t simpleawsnodejsapp .

#run it with this command:
#docker run -p 3000:3000 simpleawsnodejsapp