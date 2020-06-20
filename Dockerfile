FROM node:12-alpine

LABEL maintainer="Luis Miguel Vicente Fuentes"

# environment variables
ENV APP_DEFAULT_USER node
ENV APP_DEFAULT_GROUP node
ENV APP_INSTALL_DIR /opt/gh-secrets
ENV APP_WORKING_DIR /app

# install working directory
WORKDIR ${APP_INSTALL_DIR}/

# copy app files
COPY package.json package-lock.json /${APP_INSTALL_DIR}/
COPY bin/ /${APP_INSTALL_DIR}/bin/

# install dependencies
RUN npm ci
# install binary
RUN npm install -g .

# working directory
WORKDIR ${APP_WORKING_DIR}/

# APP_DEFAULT_USER owns APP_WORKING_DIR directory
RUN chown -R ${APP_DEFAULT_USER}:${APP_DEFAULT_GROUP} ${APP_WORKING_DIR}

# non-root user
USER ${APP_DEFAULT_USER}

# run
ENTRYPOINT [ "gh-secrets" ]
