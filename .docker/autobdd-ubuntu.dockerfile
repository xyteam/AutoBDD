FROM ubuntu:20.04
USER root
ENV DEBIAN_FRONTEND noninteractive

# switch to faster/local ubuntu archive, uncomment a line or add a line
# RUN sed -i 's#http://archive.ubuntu.com/#http://tw.archive.ubuntu.com/#' /etc/apt/sources.list;
# RUN sed -i 's#http://archive.ubuntu.com/#http://mirror.math.princeton.edu/pub/#' /etc/apt/sources.list;

# apt install essential tools for apt install/upgrade
RUN apt clean -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \
    apt full-upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \
    # Install initial packages for apt configuration
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
		apt-utils curl wget software-properties-common sudo tzdata; \
    # Set the timezone.
    dpkg-reconfigure -f noninteractive tzdata; \
    # install standard linux tools needed for automation framework
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        # autobdd-run
        aosd-cat \
        autofs \
        binutils \
        build-essential \
        colorized-logs \
        default-jdk \
        docker.io \
        ffmpeg \
        git \
        gnupg2 \
        gpg-agent \
        imagemagick \
        libappindicator3-1 \
        libatk-bridge2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libopencv-dev \
        libpng++-dev \
        libpython3-stdlib \
        libtesseract-dev \
        libxss1 \
        libxtst-dev \
        net-tools \
        ntpdate \
        openssh-server \
        parallel \
        python3-dev \
        python3-pip \
        rdesktop \
        rsync \
        sshpass \
        tcpreplay \
        tesseract-ocr \
        unzip \
        wmctrl \
        x11-xserver-utils \
        xdg-utils \
        xdotool \
        xvfb \
        zlib1g-dev \
        fonts-wqy-microhei \
        ttf-wqy-zenhei \
        # autobdd-dev
        alsa-utils \
        arc-theme \
        dirmngr \
        gnome-themes-standard \
        lxde \
        mesa-utils \
        vim-tiny \
        x11vnc \
        zenity \
        # fonts
        fonts-wqy-microhei \
        ttf-wqy-zenhei; \
    # install python2, pip2 and python2 pytest to support py2 test projects (autobdd does not need py2, this section can be removed)
    # apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        # python2 \
        # libpython2.7-stdlib \
        # python-dev; \
    # curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py; \
    # python2 get-pip.py; \
    # pip2 install pytest; \
    # final autoremove
    apt --purge autoremove -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold";

# run finishing set up
RUN update-alternatives --install /usr/bin/python python $(which $(readlink $(which python3))) 10; \
    update-alternatives --install /usr/bin/pip pip $(which pip3) 10; \
    update-alternatives --install /usr/local/bin/pip pip $(which pip3) 10; \
    echo "fs.inotify.max_user_watches = 524288" | sudo tee -a /etc/sysctl.conf; \
    ln -s /usr/lib/jni/libopencv_java*.so /usr/lib/libopencv_java.so; \
    mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix; \
    ldconfig; \
    update-ca-certificates; \
    rm -rf /var/lib/apt/lists/*; \
    pip3 install supervisor;

# tini
ARG TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /bin/tini
RUN chmod +x /bin/tini

# finalize docker setup
WORKDIR /root
ENV HOME=/root \
    SHELL=/bin/bash    
HEALTHCHECK NONE
EXPOSE 5900
EXPOSE 8000
EXPOSE 22
