ARG AUTOBDD_VERSION
FROM xyteam/autobdd-ubuntu:${AUTOBDD_VERSION}
USER root
ENV DEBIAN_FRONTEND noninteractive

# Phase 5: runtime re-baseline on Ubuntu 22.04 -> Node 20 LTS + modern Chrome +
# chromedriver-on-PATH + Java 17 (default-jdk on jammy, pulled by the ubuntu base).
# wdio9's local runner drives the browser via the matching driver found on PATH.

# apt set keys for additional packages (gpg --dearmor keyrings; apt-key is deprecated)
RUN \
    # NodeSource for Node 20 LTS
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - ; \
    # google-chrome stable (modern)
    rm -f /etc/apt/sources.list.d/google-chrome.list && \
    mkdir -p /usr/share/keyrings && \
    curl -fsSL --no-check-certificate https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    # k6
    curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/k6.gpg] https://dl.k6.io/deb stable main" > /etc/apt/sources.list.d/k6.list && \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" && \
    apt install -q -y --allow-unauthenticated --fix-missing -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        nodejs \
        google-chrome-stable \
        k6 && \
    # Install chromedriver matching the installed google-chrome-stable onto PATH
    CHROME_VER=$(google-chrome --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+') && \
    CHROME_MAJOR=$(echo "$CHROME_VER" | cut -d. -f1) && \
    DRIVER_URL="https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR}" && \
    CD_VER=$(curl -fsSL "$DRIVER_URL" | tr -d '\n') && \
    curl -fsSL -o /tmp/chromedriver_linux64.zip "https://chromedriver.storage.googleapis.com/${CD_VER}/chromedriver_linux64.zip" && \
    unzip -o /tmp/chromedriver_linux64.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -f /tmp/chromedriver_linux64.zip && \
    echo "installed chrome ${CHROME_VER}, chromedriver ${CD_VER}"
