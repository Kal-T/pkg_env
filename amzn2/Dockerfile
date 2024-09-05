FROM amazonlinux:2

COPY infinite.sh /tmp/
COPY json-c-0.9.tar.gz /tmp
COPY libtar-1.2.20-src-11.31.tar.gz /tmp

RUN yum groupinstall "Development Tools" -y && \
    yum install openssl-devel -y && \
    yum install libssh2 -y && \
    yum install libssh2-devel -y && \
    yum install mariadb-devel -y && \
    yum install postgresql-devel -y && \
    yum install rpmdevtools rpmlint -y

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

CMD [ "./tmp/infinite.sh" ]
