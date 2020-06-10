ARG AutoBDD_Ver
FROM xyteam/autobdd-run:2.0.0
USER root
ENV USER root
ENV DEBIAN_FRONTEND noninteractive

# install Linux packages on top of autobdd-run
RUN apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        dirmngr && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A6DCF7707EBC211F && \
        apt-add-repository "deb http://ppa.launchpad.net/ubuntu-mozilla-security/ppa/ubuntu bionic main" -y && \
        sudo apt-get update && \
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        alsa-utils \
        arc-theme \
        gnome-themes-standard \
        lxde \
        mesa-utils \
        vim-tiny \
        x11vnc \
        zenity \
        && apt autoclean -y \
        && apt autoremove -y \
        && rm -rf /var/lib/apt/lists/* \
        && pip install supervisor

# tini for subreap
ARG TINI_VERSION=v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /bin/tini
RUN chmod +x /bin/tini

# copy preset ubuntu system env
COPY docker/autobdd-dev.root /

# insert entry point
COPY docker/autobdd-dev.startup.sh /
RUN chmod +x /autobdd-dev.startup.sh

# finalize docker setup
WORKDIR /root
ENV HOME=/root \
    SHELL=/bin/bash    
HEALTHCHECK --interval=30s --timeout=5s CMD curl --fail http://127.0.0.1:6079/api/health
ENTRYPOINT ["/autobdd-dev.startup.sh"]
EXPOSE 5900
EXPOSE 22
