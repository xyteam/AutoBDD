# autobdd-base — L0 (lean OS + essentials) + L0d (X display + desktop) + L1 (screen engine)
# Public tag: xyteam/autobdd-base:<v>. Screen-only capable; no browser, no wdio/cucumber.
# The L1 CLI seam (findTargetImage) is the frozen public contract (docs/CONTRACT.md).
FROM ubuntu:24.04
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
        x11-xserver-utils xdg-utils xdotool wmctrl \
        tini supervisor \
        fonts-wqy-microhei ttf-wqy-zenhei && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get --purge autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Remove the base image's default 'ubuntu' user (UID/GID 1000) so the entrypoint can
# create the test user at the host's UID/GID.
RUN userdel -r ubuntu 2>/dev/null || true; groupdel ubuntu 2>/dev/null || true

# ---------------------------------------------------------------------------
# L0d — X display + desktop (GUI substrate; WM pinned for rendering determinism)
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
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -q -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# the vendored bridge + its runtime deps (bridge only; the framework deps are L2)
COPY third_party/xysikulixapi /root/Projects/AutoBDD/third_party/xysikulixapi
RUN cd /root/Projects/AutoBDD/third_party/xysikulixapi && \
    npm config set script-shell /bin/bash && \
    npm install --omit=dev --loglevel=error && \
    rm -rf /tmp/*

# Expose the seam on PATH and warm the Oculix natives at build (with a display), then
# bake them to a world-readable dir + LD_LIBRARY_PATH (no per-container extraction).
ENV PATH="/root/Projects/AutoBDD/third_party/xysikulixapi/bin:${PATH}"
RUN mkdir -p /opt/oculix-natives && \
    ( Xvfb :99 -screen 0 400x300x24 >/dev/null 2>&1 & XPID=$!; sleep 2; \
      DISPLAY=:99 node -e "const j=require('/root/Projects/AutoBDD/third_party/xysikulixapi/node_modules/java-bridge'); j.ensureJvm({opts:['-Xms128m','-Xmx512m']}); try{ const X=require('/root/Projects/AutoBDD/third_party/xysikulixapi/lib/xysikulixapi.js'); new X.Screen(); }catch(e){}" >/dev/null 2>&1; \
      kill $XPID 2>/dev/null ) || true; \
    cp -f /root/.cache/legerix/*/linux-x86-64*/*.so* /opt/oculix-natives/ 2>/dev/null || true; \
    chmod 755 /opt/oculix-natives; \
    ln -sf /root/Projects/AutoBDD/third_party/xysikulixapi/bin/findTargetImage.js /usr/local/bin/findTargetImage; \
    echo "baked oculix natives: $(ls /opt/oculix-natives 2>/dev/null | tr '\n' ' ')"
ENV LD_LIBRARY_PATH=/opt/oculix-natives

WORKDIR /root
ENV HOME=/root SHELL=/bin/bash
HEALTHCHECK NONE
EXPOSE 5900
EXPOSE 8000
EXPOSE 22
