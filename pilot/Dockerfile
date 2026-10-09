FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && mkdir -p /data && chown node:node /data
USER node
ENV PILOT_DATA_DIR=/data
VOLUME /data
ENTRYPOINT ["node", "pilot/cli.mjs"]
CMD ["doctor"]
