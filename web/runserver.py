# -*- coding: utf-8 -*-
import sys
from flask import Flask
import datetime
import threading
import docker
from flask import request, redirect, url_for, render_template, flash, session
from forms import NewContainer

app = Flask(__name__)

c = docker.from_env()


@app.template_filter('date')
def _jinja2_filter_datetime(date):
    date = datetime.datetime.fromtimestamp(date)
    return date.strftime('%d/%m/%Y %H:%M:%S')


@app.route('/')
def index():
    info = c.info()
    return render_template("index.html", info=info)

@app.route('/images/')
def images():
    images = c.images.list()
    return render_template("images.html", images=images)



@app.route('/images/all/delete')
def imagesalldelete():
    images = c.images.list()
    for image in images:
        try:
            c.remove(image.get('Id'))
        except Exception as error:
            print(error)
    return redirect(url_for("images"))


@app.route('/images/<imagen_id>')
def imageninfo(imagen_id=None):
    inspect = c.inspect_image(imagen_id)
    return render_template("images.html", inspect=inspect)


@app.route('/images/<imagen_id>/run/')
def runimage(imagen_id=None):
    data = c.inspect_image(imagen_id)
    try:
        c.start(c.create_container(image=imagen_id, command=data['config']['Cmd'], stdin_open=True, detach=True))
        return redirect(url_for("containers"))
    except docker.APIError as error:
        if error.explanation == "No command specified":
            flash("Pas de commande", "error")
            return redirect(url_for("images"))



@app.route('/images/<imagen_id>/delete/')
def deleteimage(imagen_id=None):
    try:
        c.remove_image(imagen_id)
    except docker.APIError as error:
        flash(error.explanation, "error")
    return redirect(url_for("images"))


@app.route('/containers/')
def containers():
    containers = c.containers.list()
    return render_template("containers.html", containers=containers)


@app.route('/containers/all/')
def containersall():
    containers = c.containers.list()
    return render_template("containers.html", containers=containers)


@app.route('/containers/all/stop')
def containersallstop():
    containers = c.containers.list()
    for container in containers:
        container.stop()
    flash("All containers stopped.", "success")
    return redirect(url_for("containers"))


@app.route('/containers/all/delete')
def containersalldelete():
    containers = c.containers.list()
    for container in containers:
        container.remove()
    flash("All containers deleted.", "success")
    return redirect(url_for("containers"))


@app.route('/containers/<container_id>')
def containerinfo(container_id=None):
    containerinfo = c.inspect_container(container_id)
    logs = c.logs(container_id).rstrip("\n").split("\n")
    logs.reverse()
    if logs[0] == "":
        logs = None
    return render_template("containers.html", containerinfo=containerinfo, logs=logs)


@app.route('/containers/new', methods=["GET", "POST"])
def containernew():
    form = NewContainer()
    form.image.choices = [(x['Id'], x['RepoTags'][0]) for x in c.images()]
    if request.method == "GET":
        return render_template("newcontainers.html", form=form)
    elif request.method == "POST":
        if form.validate_on_submit():
            container = c.create_container(image=form.data['image'], name=form.data.get('name'),
                                           hostname=form.data.get('hostname'), stdin_open=True,
                                           dns=form.data.get('dns'), mem_limit=form.data.get('mem_limit'),
                                           command=form.data.get('command'), privileged=form.data.get('privileged'))
            if form.start.data:
                c.start(container['Id'])
                flash("Container created and started.", "success")
                return redirect(url_for("containers"))
            else:
                flash("Container %s created." % container['Id'])
                return redirect(url_for("containersall"))
        return render_template("newcontainers.html", form=form)


@app.route('/containers/<container_id>/stop')
def containerstop(container_id=None):
    c.stop(container_id)
    flash("Container %s stopped." % container_id, "success")
    return redirect(url_for("containers"))


@app.route('/containers/<container_id>/start')
def containerstart(container_id=None):
    c.start(container_id)
    flash("Container %s started." % container_id, "success")
    return redirect(url_for("containers"))


@app.route('/containers/<container_id>/delete')
def containerdelete(container_id=None):
    c.stop(container_id)
    c.remove_container(container_id)
    flash("Container deleted.", "success")
    return redirect(url_for("containers"))


@app.route('/configs/')
def configs():
    return render_template("configs.html")


@app.route('/configs/new')
def configsnew():
    return render_template("configsnew.html")


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)
