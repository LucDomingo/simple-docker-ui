FROM alpine

COPY go.tgz .

ENV https_proxy http://AN004794:Password1234*@internet-app.corp.thales:8000
ENV http_proxy http://AN004794:Password1234*@internet-app.corp.thales:8000
ARG cert_location=/usr/local/share/ca-certificates

RUN echo "Installing go version 1.14 ..." &&  \
    apk upgrade --update-cache --available && \
    apk add --no-cache --virtual .build-deps bash gcc musl-dev openssl go ca-certificates openssl && \ 
    # wget --no-check-certificate -O go.tgz "https://dl.google.com/go/go1.14.src.tar.gz" && \
    tar -C /usr/local -xzf go.tgz && \
    cd /usr/local/go/src/ && \
    ./make.bash && \
    export PATH="/usr/local/go/bin:$PATH" && \
    export GOPATH=/opt/go/ && \
    export PATH=$PATH:$GOPATH/bin && \ 
    apk del .build-deps && \
    go version

ADD . .
RUN cd beego && export PATH="/usr/local/go/bin:$PATH" &&  export GOPATH=/opt/go/ && export PATH=$PATH:$GOPATH/bin && go install

RUN export PATH="/usr/local/go/bin:$PATH" &&  export GOPATH=/opt/go/ && export PATH=$PATH:$GOPATH/bin && go build

EXPOSE 3001
CMD ./docker-ui
