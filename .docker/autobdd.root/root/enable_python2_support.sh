# (autobdd does not need py2, run this script if your test project needs py2)
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends \
	    -o Dpkg::Options::="--force-confdef" \
	    -o Dpkg::Options::="--force-confold" \
        python2 \
        libpython2.7-stdlib \
        python-dev; \
    curl https://bootstrap.pypa.io/2.7/get-pip.py --output get-pip.py && \
        python2 get-pip.py && \
        rm -f get-pip.py; \
# preserve python3 as default
    update-alternatives --install /usr/bin/python python $(which $(readlink $(which python3))) 10; \
    update-alternatives --install /usr/bin/pip pip $(which pip3) 10; \
    update-alternatives --install /usr/local/bin/pip pip $(which pip3) 10; \
