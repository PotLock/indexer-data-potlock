FROM node:20.6-bullseye-slim
RUN apt-get update \
    && apt-get install -y gcc vim supervisor \
    && rm -rf /tmp/* /var/cache/* 

RUN mkdir /var/log/apps
# The above codes are base-image (Separeate it to optimize deployment)
WORKDIR /webapp
COPY ./supervisor/services.conf /etc/supervisor/conf.d
COPY ./ /webapp 

RUN npm install
# RUN npm install -g typescript
# RUN npm run build


# uncomment if using CICD(jenkins)
ENTRYPOINT ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]