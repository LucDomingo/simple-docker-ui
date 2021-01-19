FROM alpine

RUN cat /etc/resolv.conf
ENV https_proxy=http://AN004794:Password1234*@internet-app.corp.thales:8000
ENV http_proxy=http://AN004794:Password1234*@internet-app.corp.thales:8000

RUN echo "Installing python and pip ..." && \
    apk add python3 && \
    apk add py3-pip

COPY web/ /var/www/web/

RUN pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r /var/www/web/requirements.txt

EXPOSE 5000

CMD python3 /var/www/web/runserver.py
