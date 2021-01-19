FROM alpine

RUN echo "Installing python and pip ..." && \
    apk add python3 && \
    apk add py3-pip

COPY web/ /var/www/web/

RUN pip3 install -r /var/www/web/requirements.txt

EXPOSE 5000

CMD python3 /var/www/web/runserver.py
