#Imagen oficail de node
FROM node:20-alpine

# Instalar dependencias necesarias para bcrypt y otras librerías nativas
RUN apk add --no-cache python3 make g++ bash

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor en modo desarrollo
CMD ["npm", "run", "start:dev"]
