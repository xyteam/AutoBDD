# (autobdd does not need py2, run this script if your test project needs py2)
    apt install -q -y --allow-unauthenticated --fix-missing --no-install-recommends \
	    -o Dpkg::Options::="--force-confdef" \
	    -o Dpkg::Options::="--force-confold" \
    python2 \
    libpython2.7-stdlib \
    python-dev; \
    curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py; \
    python2 get-pip.py; \
    pip2 install pytest;
