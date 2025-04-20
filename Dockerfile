# Use the official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy the rest of the application code to the container
COPY . .

# Expose the port the Nuxt.js app runs on (default is 3000)
EXPOSE 3000

# Build the Nuxt.js app for production
RUN npm run build

ENV HOST 0.0.0.0

# Start the Nuxt.js app
# CMD [ "node", ".output/server/index.mjs" ]

CMD [ "node", "dist/index.js" ]

