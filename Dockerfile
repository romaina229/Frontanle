# Étape 1 : Construction de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

# Étape 2 : Serveur de production
FROM nginx:alpine

# Copier les fichiers construits
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]