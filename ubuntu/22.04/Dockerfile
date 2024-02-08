FROM ubuntu:22.04

# Set noninteractive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install required packages
RUN apt-get update && apt-get install -y \
    sudo \
    expect \
    build-essential \
    binutils \
    lintian \
    debhelper \
    dh-make \
    devscripts \
    libmariadb-dev-compat \
    libmariadb-dev \
    libpq-dev \
    libssh2-1-dev \
    mariadb-client \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install additional files
COPY json-c-0.9.tar.gz /tmp
COPY libtar-1.2.20-src-11.31.tar.gz /tmp

RUN tar -xvzf /tmp/json-c-0.9.tar.gz -C /tmp/ && \
    tar -xvzf /tmp/libtar-1.2.20-src-11.31.tar.gz -C /tmp/ && \
    rm -rf /tmp/*.tar.gz

RUN cd /tmp/json-c-0.9/ && \
    ./configure --with-pic && \
    make && make install

RUN cd /tmp/libtar-1.2.20/ && \
    ./configure --with-pic && \
    make && make install

# Create a user and group
RUN groupadd -r dat \
    && useradd -r -g dat dat \
    && echo "dat:password" | chpasswd \
    && echo "dat ALL=(ALL) ALL" >> /etc/sudoers

# Set the default user
USER dat