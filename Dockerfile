# Use the official lightweight Nginx Alpine image
FROM nginx:alpine

# Update packages to ensure the latest security patches
RUN apk update && apk upgrade

# Copy the static website files to the Nginx html directory
COPY index.html styles.css script.js CardData.js bg.mp4 bg.png /usr/share/nginx/html/
COPY relics/ /usr/share/nginx/html/relics/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
