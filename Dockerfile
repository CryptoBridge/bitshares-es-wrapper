### BUILD
FROM cryptobridge/node

### SET TIMEZONE
RUN apk add --no-cache tzdata
RUN cp /usr/share/zoneinfo/UTC /etc/localtime
RUN echo "UTC" >  /etc/timezone

WORKDIR /app
COPY . .

RUN npm install --production
EXPOSE 9201
USER node

CMD ["npm", "start"]
