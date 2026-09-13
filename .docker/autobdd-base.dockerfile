# autobdd-base — L0 (lean OS + essentials) + L0 (X display + desktop) + L1 (screen engine)
# Public tag: xyteam/autobdd-base:<v>. Screen-only capable; no browser, no wdio/cucumber.
# The L1 CLI seam (findTargetImage) is the frozen public contract (docs/CONTRACT.md).
# Digest-pinned (NFR-P2): the tag can move, the digest cannot. `ubuntu:24.04`.
FROM ubuntu:24.04@sha256:224a1869083a311ef3f13648a154ba79832fbef6364d31493642ca03082da254
USER root
ENV DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# L0 — lean OS + essential tooling
# ---------------------------------------------------------------------------
RUN apt-get update -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" && \
    apt-get install -q -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        apt-utils ca-certificates curl wget git jq unzip zip gnupg2 sudo tzdata \
        parallel net-tools openssh-server rsync sshpass ssh-askpass \
        binutils build-essential pkg-config \
        python3 python3-pip python3-venv \
        imagemagick ffmpeg aosd-cat colorized-logs \
        x11-xserver-utils x11-utils xdg-utils xdotool wmctrl \
        tini supervisor \
        fonts-wqy-microhei ttf-wqy-zenhei && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get --purge autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Remove the base image's default 'ubuntu' user (UID/GID 1000) so the entrypoint can
# create the test user at the host's UID/GID.
RUN userdel -r ubuntu 2>/dev/null || true; groupdel ubuntu 2>/dev/null || true

# ---------------------------------------------------------------------------
# L0 — X display + desktop (GUI substrate; WM pinned for rendering determinism)
#   required: Xvfb + a light WM (openbox)
#   optional: full desktop + VNC for the interactive/dev GUI (bundled in v1)
# ---------------------------------------------------------------------------
RUN apt-get update -y && \
    apt-get install -q -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
        xvfb openbox \
        x11vnc zenity \
        alsa-utils mesa-utils \
        arc-theme lxde \
        fonts-wqy-microhei ttf-wqy-zenhei && \
    update-alternatives --install /usr/bin/python python "$(which python3)" 10 && \
    update-alternatives --install /usr/bin/pip pip "$(which pip3)" 10 && \
    mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix && \
    mkdir -p /root/Projects /root/Downloads && \
    ldconfig && update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# L0 — desktop supervision: Xvfb + openbox + LXDE panel + x11vnc + sshd under
# supervisord, so the base supports an interactive ssh/VNC GUI by itself.
COPY .docker/autobdd.root/etc/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .docker/autobdd.root/usr/local/bin/xvfb.sh /usr/local/bin/xvfb.sh
COPY .docker/autobdd.root/usr/local/share/doro-lxde-wallpapers /usr/local/share/doro-lxde-wallpapers
COPY .docker/autobdd.root/root/autobdd-dev.startup.sh /root/autobdd-dev.startup.sh
RUN chmod +x /usr/local/bin/xvfb.sh /root/autobdd-dev.startup.sh && \
    mkdir -p /var/log/supervisor && \
    ln -sf "$(command -v supervisord)" /usr/local/bin/supervisord && \
    printf 'export DISPLAY=:1\nnpm config set script-shell /bin/bash 2>/dev/null\n' >> /root/.bash_profile

# ---------------------------------------------------------------------------
# L1a — Java 17 (Oculix floor) — pinned to the 17 series (24.04 default-jdk is 21)
# ---------------------------------------------------------------------------
RUN apt-get update -y && \
    apt-get install -q -y --no-install-recommends openjdk-17-jdk && \
    update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java && \
    update-alternatives --set javac /usr/lib/jvm/java-17-openjdk-amd64/bin/javac && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# L1b — Node (seam runtime: the findTargetImage CLI uses java-bridge) + the
#       screen engine: vendored Oculix bridge + warmed natives. No wdio/cucumber.
# ---------------------------------------------------------------------------
# Exact + checksum-verified (NFR-P3/P5): the official tarball, not a floating apt repo.
# Node 20 reached EOL 2026-04-30; 24 is the active LTS (EOL 2028-04-30).
ARG NODE_VERSION=24.21.0
ARG NODE_SHA256=fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6
RUN curl -fsSL -o /tmp/node.tar.xz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" && \
    echo "${NODE_SHA256}  /tmp/node.tar.xz" | sha256sum -c - && \
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 --exclude=CHANGELOG.md --exclude=LICENSE --exclude=README.md && \
    rm /tmp/node.tar.xz && \
    node -v && npm -v

# the vendored bridge, installed world-readable under /opt/autobdd so the CLI seam works
# for ANY user — /root (where the framework tree lives) is not traversable by others.
COPY third_party/xysikulixapi /opt/autobdd/third_party/xysikulixapi
RUN cd /opt/autobdd/third_party/xysikulixapi && \
    npm config set script-shell /bin/bash && \
    npm install --omit=dev --loglevel=error && \
    rm -rf /tmp/*

# Expose the seam on PATH and warm the Oculix natives at build (with a display), then bake
# them to a world-readable dir wired into ld.so (no per-container extraction, no env needed).
RUN mkdir -p /opt/oculix-natives && \
    ( Xvfb :99 -screen 0 400x300x24 >/dev/null 2>&1 & XPID=$!; sleep 2; \
      DISPLAY=:99 node -e "const j=require('/opt/autobdd/third_party/xysikulixapi/node_modules/java-bridge'); j.ensureJvm({opts:['-Xms128m','-Xmx512m']}); try{ const X=require('/opt/autobdd/third_party/xysikulixapi/lib/xysikulixapi.js'); new X.Screen(); }catch(e){}" >/dev/null 2>&1; \
      kill $XPID 2>/dev/null ) || true; \
    cp -f /root/.cache/legerix/*/linux-x86-64*/*.so* /opt/oculix-natives/ 2>/dev/null || true; \
    chmod 755 /opt/oculix-natives && \
    echo /opt/oculix-natives > /etc/ld.so.conf.d/oculix-natives.conf && ldconfig && \
    ln -sf /opt/autobdd/third_party/xysikulixapi/bin/findTargetImage.js /usr/local/bin/findTargetImage && \
    echo "baked oculix natives: $(ls /opt/oculix-natives 2>/dev/null | tr '\n' ' ')"
ENV LD_LIBRARY_PATH=/opt/oculix-natives

WORKDIR /root
ENV HOME=/root SHELL=/bin/bash
HEALTHCHECK NONE
EXPOSE 5900
EXPOSE 8000
EXPOSE 22

# Record the resolved versions this base was built with (NFR-P4). The framework appends
# its own (Chrome/chromedriver) lines to the same file.
RUN { echo "# autobdd-base"; \
      echo "os=$(. /etc/os-release; echo $PRETTY_NAME)"; \
      echo "ubuntu_digest=sha256:224a1869083a311ef3f13648a154ba79832fbef6364d31493642ca03082da254"; \
      echo "java=$(java -version 2>&1 | head -1)"; \
      echo "node=$(node -v)"; \
      echo "python=$(python3 --version 2>&1)"; \
      echo "built=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
    } > /etc/autobdd-versions && cat /etc/autobdd-versions
