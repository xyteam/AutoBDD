# autobdd-framework — the product: autobdd-base (L0+L0d+L1) + L2
#   L2 = Chrome + matching chromedriver, WebdriverIO, Cucumber, the AutoBDD framework.
# Published as xyteam/autobdd-framework:<v>; xyteam/autobdd:<v> is a deprecated alias.
# Guest tools (postman/jmeter/jest/pytest) are NOT shipped — add them per project.
ARG AUTOBDD_VERSION
FROM xyteam/autobdd-base:${AUTOBDD_VERSION}
USER root
ENV DEBIAN_FRONTEND=noninteractive

# L2 — Chrome + matching chromedriver on PATH. (Phase B will pin to an exact Chrome for
# Testing version per NFR-P3; Phase A keeps the apt stable install as today.)
RUN rm -f /etc/apt/sources.list.d/google-chrome.list && \
    mkdir -p /usr/share/keyrings && \
    curl -fsSL -k https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    mkdir -p /etc/opt/chrome/policies/managed && \
    echo "{\"CommandLineSecurityWarningsEnabled\": false}" > /etc/opt/chrome/policies/managed/managed_policies.json && \
    apt-get update -y && \
    apt-get install -q -y --no-install-recommends google-chrome-stable && \
    rm -rf /var/lib/apt/lists/* && \
    CHROME_VER=$(google-chrome --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+') && \
    CFT_JSON=$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json) && \
    DRIVER_URL=$(echo "$CFT_JSON" | jq -r --arg v "$CHROME_VER" '.versions[] | select(.version == $v) | .downloads.chromedriver[] | select(.platform == "linux64") | .url' | head -1) && \
    test -n "$DRIVER_URL" && \
    curl -fsSL -o /tmp/chromedriver_linux64.zip "$DRIVER_URL" && \
    unzip -o /tmp/chromedriver_linux64.zip -d /tmp/cd && \
    install -m 0755 /tmp/cd/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver_linux64.zip /tmp/cd && \
    { echo "chrome=${CHROME_VER}"; echo "chromedriver=$(chromedriver --version | awk '{print $2}')"; echo "built=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; } > /etc/autobdd-versions && \
    cat /etc/autobdd-versions
ENV CHROMEDRIVER_PATH=/usr/local/bin/chromedriver

# L2 — native build deps for the framework's keyboard/mouse module (robotjs: X11/XTEST).
# (robotjs → Oculix Mouse/Key migration is tracked separately; until then it must build.)
RUN apt-get update -y && \
    apt-get install -q -y --no-install-recommends \
        libxtst-dev libx11-dev libxi-dev libxinerama-dev libxrandr-dev \
        libpng-dev libxtst6 libxi6 && \
    rm -rf /var/lib/apt/lists/*

# L2 — the AutoBDD framework source + its full Node dependency tree (wdio/cucumber).
ADD . /root/Projects/AutoBDD
RUN mkdir -p /root/Downloads && \
    cd /root/Projects/AutoBDD && \
    pip install --break-system-packages -r requirement.txt 2>/dev/null || true && \
    npm config set script-shell "/bin/bash" && \
    npm cache clean --force && \
    npm --loglevel=error install && \
    npm run --loglevel=error clean && \
    rm -rf /tmp/chrome_profile_* /tmp/download_*

# copy preset root system env (bash_profile, startup scripts, supervisor)
COPY .docker/autobdd.root /
RUN chmod +x /root/.bash_profile /root/autobdd-run.startup.sh /root/autobdd-dev.startup.sh 2>/dev/null || true
