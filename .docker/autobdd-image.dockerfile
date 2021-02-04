ARG AUTOBDD_VERSION
FROM xyteam/autobdd-nodejs:${AUTOBDD_VERSION}
USER root
ENV DEBIAN_FRONTEND noninteractive

# install AutoBDD
ADD . /root/Projects/AutoBDD

# setup AutoBDD
RUN mkdir -p /root/Downloads && \
    cd /root/Projects/AutoBDD && \
    pip install -r requirement.txt && \
    npm config set script-shell "/bin/bash" && \
    npm cache clean --force && \
    npm --loglevel=error install && \
    npm run --loglevel=error test && \
    npm run --loglevel=error clean && \
    rm -rf /tmp/chrome_profile_* /tmp/download_*

# copy preset ubuntu system env
COPY .docker/autobdd.root /
RUN chmod +x /root/.bash_profile /root/autobdd-run.startup.sh /root/autobdd-dev.startup.sh 
