# autobdd-framework — the product: autobdd-base (L0+L1) + L2
#   L2 = Chrome + matching chromedriver, WebdriverIO, Cucumber, the AutoBDD framework.
# Published as xyteam/autobdd-framework:<v>; xyteam/autobdd:<v> is a deprecated alias.
# Guest tools (postman/jmeter/jest/pytest) are NOT shipped — add them per project.
ARG AUTOBDD_VERSION
FROM xyteam/autobdd-base:${AUTOBDD_VERSION}
USER root
ENV DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# L2 — Chrome + matching chromedriver, EXACT and pinned (NFR-P3).
#   Both artifacts come from Chrome for Testing — the browser build the driver is
#   released with — instead of the floating apt "stable" channel, and both are
#   checksum-verified at build time (NFR-P5). Chrome for Testing publishes no
#   per-file checksum, so the digests below are pinned at the source (a bump is a
#   reviewed change that re-runs both conformance suites, NFR-P6).
#   The debs' runtime library set is installed explicitly: the zip carries no
#   dependency metadata. Names are noble's (24.04 applied the time_t transition:
#   libasound2 → libasound2t64, libgtk-3-0 → libgtk-3-0t64, …).
# ---------------------------------------------------------------------------
ARG CHROME_VERSION=153.0.8010.36
ARG CHROME_SHA256=167a098c4fdec156b58a9f678c90a84f9072d789f9c6e7b35496a6987b8b7ef8
ARG CHROMEDRIVER_SHA256=c05f3bfb501b37b12b7fa2a54b8b30b51d089a64389898362aeb2785f12ac83f
ENV CHROME_BINARY=/opt/chrome-for-testing/chrome-linux64/chrome
ENV CHROMEDRIVER_PATH=/usr/local/bin/chromedriver
RUN apt-get update -y && \
    apt-get install -q -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        fonts-liberation libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 \
        libatspi2.0-0t64 libcairo2 libcups2t64 libdbus-1-3 libexpat1 libgbm1 \
        libglib2.0-0t64 libgtk-3-0t64 libnspr4 libnss3 libpango-1.0-0 libudev1 \
        libvulkan1 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
        libxkbcommon0 libxrandr2 wget xdg-utils && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /etc/opt/chrome/policies/managed && \
    echo "{\"CommandLineSecurityWarningsEnabled\": false}" > /etc/opt/chrome/policies/managed/managed_policies.json
RUN CFT="https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64" && \
    curl -fsSL -o /tmp/chrome.zip "${CFT}/chrome-linux64.zip" && \
    echo "${CHROME_SHA256}  /tmp/chrome.zip" | sha256sum -c - && \
    mkdir -p /opt/chrome-for-testing && \
    unzip -q /tmp/chrome.zip -d /opt/chrome-for-testing && \
    curl -fsSL -o /tmp/chromedriver.zip "${CFT}/chromedriver-linux64.zip" && \
    echo "${CHROMEDRIVER_SHA256}  /tmp/chromedriver.zip" | sha256sum -c - && \
    unzip -q /tmp/chromedriver.zip -d /tmp/cd && \
    install -m 0755 /tmp/cd/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    printf '%s\n' \
      '#!/bin/sh' \
      '# google-chrome shim. Chrome for Testing reports "Google Chrome for Testing <v>",' \
      '# which tools that parse "<product> <version>" misread (Cypress 6 takes "for" as the' \
      '# version and aborts). The binary is still addressable as google-chrome; only that' \
      '# one qualifier is dropped from --version. wdio uses $CHROME_BINARY, not this shim.' \
      'CHROME=/opt/chrome-for-testing/chrome-linux64/chrome' \
      'if [ "$1" = "--version" ]; then' \
      '  "$CHROME" --version | sed "s/ for Testing//"' \
      '  exit 0' \
      'fi' \
      'exec "$CHROME" "$@"' > /usr/local/bin/google-chrome && \
    chmod 0755 /usr/local/bin/google-chrome && \
    ln -sf google-chrome /usr/local/bin/google-chrome-stable && \
    ln -sf google-chrome /usr/local/bin/chrome && \
    chmod 4755 /opt/chrome-for-testing/chrome-linux64/chrome_sandbox 2>/dev/null || true; \
    rm -rf /tmp/chrome.zip /tmp/chromedriver.zip /tmp/cd && \
    "$CHROME_BINARY" --version && google-chrome --version && chromedriver --version && \
    chrome_version=$("${CHROME_BINARY}" --version | grep -oE '[0-9]+(\.[0-9]+)+' | head -1); \
    { echo "chrome=${chrome_version}"; \
      echo "chromedriver=$(chromedriver --version | awk '{print $2}')"; \
      echo "built=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; } >> /etc/autobdd-versions && \
    cat /etc/autobdd-versions

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
    npm ci --loglevel=error && \
    npm run --loglevel=error clean && \
    rm -rf /tmp/chrome_profile_* /tmp/download_*

# copy preset root system env (bash_profile, startup scripts, supervisor)
COPY .docker/autobdd.root /
RUN chmod +x /root/.bash_profile /root/autobdd-run.startup.sh /root/autobdd-dev.startup.sh 2>/dev/null || true
