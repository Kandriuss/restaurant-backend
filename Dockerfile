# Imagen oficial de node
FROM node:20-alpine

# Instalar dependencias necesarias para bcrypt y otras librerías nativas
RUN apk add --no-cache python3 make g++ bash

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor en modo desarrollo
# Nota: El código fuente se monta como volumen en docker-compose.yml
CMD ["npm", "run", "start:dev"]
