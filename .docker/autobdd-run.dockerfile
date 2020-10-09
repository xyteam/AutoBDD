# build autobdd-run:
# cd .docker && docker-compose build autobdd-run
#

FROM ubuntu:20.04
USER root
ENV USER root
ENV DEBIAN_FRONTEND noninteractive
ARG AutoBDD_Ver

# switch to faster ubuntu archive
# RUN sed -i 's#http://archive.ubuntu.com/#http://tw.archive.ubuntu.com/#' /etc/apt/sources.list;
RUN sed -i 's#http://archive.ubuntu.com/#http://mirror.math.princeton.edu/pub/#' /etc/apt/sources.list;

# apt install essential tools for apt install/upgrade
RUN apt clean -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \
    apt full-upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"; \ 
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
		apt-utils curl wget software-properties-common sudo tzdata; \
# Set the timezone.
    dpkg-reconfigure -f noninteractive tzdata; \
# install standard linux tools needed for automation framework
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        aosd-cat \
        autofs \
        binutils \
        build-essential \
        colorized-logs \
        default-jdk \
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
        unzip \
        wmctrl \
        x11-xserver-utils \
        xdg-utils \
        xdotool \
        xvfb \
        zlib1g-dev \
        fonts-wqy-microhei \
        ttf-wqy-zenhei; \
# install python2, pip2 and python2 pytest
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        python2 \
        libpython2.7-stdlib \
        python-dev; \
    curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py; \
    python2 get-pip.py; \
    pip2 install pytest; \
# install newer tesseract-ocr
    apt-get update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" && \
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        tesseract-ocr \
        libtesseract-dev; \
# system configuration update
    ldconfig; \
    update-ca-certificates; \
# final autoremove
    apt --purge autoremove -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold";

# install nodejs 12.x
RUN curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash - && \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"  && \
    apt install -q -y --allow-unauthenticated --fix-missing -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
    nodejs

# install google-chrome
RUN rm -f /etc/apt/sources.list.d/google-chrome.list && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    wget -qO- --no-check-certificate https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"  && \
    apt install -q -y --allow-unauthenticated --fix-missing -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
    google-chrome-stable && \
    mkdir -p /etc/opt/chrome/policies/managed && \
    echo "{\"CommandLineFlagSecurityWarningsEnabled\": false}" > /etc/opt/chrome/policies/managed/managed_policies.json

# run finishing set up
RUN update-alternatives --install /usr/bin/python python $(which $(readlink $(which python3))) 10; \
    update-alternatives --install /usr/bin/pip pip $(which pip3) 10; \
    update-alternatives --install /usr/local/bin/pip pip $(which pip3) 10; \
    echo "fs.inotify.max_user_watches = 524288" | sudo tee -a /etc/sysctl.conf; \
    ln -s /usr/lib/jni/libopencv_java*.so /usr/lib/libopencv_java.so; \
    mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix; \
    mkdir -p /${USER}/Projects

# install AutoBDD
ADD . /${USER}/Projects/AutoBDD

# setup AutoBDD
RUN cd /${USER}/Projects/AutoBDD && \
    pip install wheel setuptools tinydb pytest allure-pytest && \
    npm config set script-shell "/bin/bash" && \
    npm cache clean --force && \
    xvfb-run -a npm --loglevel=error install && \
    xvfb-run -a npm test && \
    rm -rf /tmp/chrome_profile_* /tmp/download_* ./test-projects/autobdd-test/test-results

# insert entry point
COPY .docker/autobdd-run.startup.sh /
RUN chmod +x /autobdd-run.startup.sh

# finalize docker setup
WORKDIR /root
ENV HOME=/root \
    SHELL=/bin/bash
ENTRYPOINT ["/autobdd-run.startup.sh"]
CMD ["--help"]
