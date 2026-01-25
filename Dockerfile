#use an offical base image so in this case i am using node
FROM node:18

# setting work directory in the container
WORKDIR /app

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# now is to install the depency listed in the package.json file
RUN npm install

# now is to copy all the source code
COPY . .

# Make port 3000 available outside this container
EXPOSE 3000

# Define the command to run your app using CMD (only one CMD allowed)
CMD [ "npm", "start" ]