ARG VERSION=latest
FROM browserless/chrome:$VERSION

# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app will run on
EXPOSE 8888

# Define the command to run your Node.js application
CMD ["node", "app.js"]