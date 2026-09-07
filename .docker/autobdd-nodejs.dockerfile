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
    curl -fsSL -k https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    # k6
    curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/k6.gpg] https://dl.k6.io/deb stable main" > /etc/apt/sources.list.d/k6.list && \
    apt update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" && \
    apt install -q -y --allow-unauthenticated --fix-missing -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        nodejs \
        google-chrome-stable \
        openjdk-17-jdk \
        k6 && \
    # Oculix jars are built with release 17 -> make Java 17 the active JVM
    update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java && \
    update-alternatives --set javac /usr/lib/jvm/java-17-openjdk-amd64/bin/javac && \
    # Install chromedriver matching the installed google-chrome-stable onto PATH.
    # Modern chromedriver is published via Chrome for Testing (the old
    # chromedriver.storage.googleapis.com API no longer carries recent majors).
    CHROME_VER=$(google-chrome --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+') && \
    CFT_JSON=$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json) && \
    DRIVER_URL=$(echo "$CFT_JSON" | jq -r --arg v "$CHROME_VER" '.versions[] | select(.version == $v) | .downloads.chromedriver[] | select(.platform == "linux64") | .url' | head -1) && \
    test -n "$DRIVER_URL" && \
    curl -fsSL -o /tmp/chromedriver_linux64.zip "$DRIVER_URL" && \
    unzip -o /tmp/chromedriver_linux64.zip -d /tmp/cd && \
    install -m 0755 /tmp/cd/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver_linux64.zip /tmp/cd && \
    echo "installed chrome ${CHROME_VER}, chromedriver ${DRIVER_URL}"
