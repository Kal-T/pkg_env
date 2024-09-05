FROM amazonlinux:2023

COPY sleep10.sh /tmp
COPY json-c-0.9.tar.gz /tmp
COPY libtar-1.2.20-src-11.31.tar.gz /tmp

# Remove the COPY of cent9.repo as it's specific to CentOS 9 and not needed for Amazon Linux 2023

# Amazon Linux 2023 uses dnf, similar to RHEL 9
RUN dnf update -y && \
    dnf install libgomp gcc automake autoconf make -y && \
    dnf install openssl-devel -y && \
    dnf install libssh2 -y && \
    dnf install libssh2-devel -y && \
    dnf install mariadb-devel -y && \
    dnf install postgresql-devel -y && \
    dnf install rpmdevtools rpmlint -y && \
    dnf clean all && \
    rm -rf /var/cache/dnf

RUN tar -xvzf /tmp/json-c-0.9.tar.gz -C /tmp/ && \
    tar -xvzf /tmp/libtar-1.2.20-src-11.31.tar.gz -C /tmp/ && \
    rm -rf /tmp/*.tar.gz

RUN cd /tmp/json-c-0.9/ && \
    ./configure --with-pic &&  \
    make && make install

RUN cd /tmp/libtar-1.2.20/ && \
    ./configure --with-pic &&  \
    make && make install

# Create a user and group
RUN groupadd -r dat && useradd -r -g dat dat

USER dat

CMD [ "/tmp/sleep10.sh" ]
