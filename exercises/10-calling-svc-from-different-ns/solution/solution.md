# Solution

First, create the namespace.

```shell
$ kubectl create namespace backend
```

Create the Deployment with 3 replicas:

```shell
$ kubectl -n backend run nginx --image=nginx --restart=Always --replicas=3 --port=80
```

Expose the deployment by creating a `ClusterIP` service on port `80`.

```shell
$ kubectl -n backend expose deployment nginx --port=80
```

Create the `frontend` namespace.

```shell
$ kubectl create namespace frontend
```

Deploy a Pod with the name `tmp` and container image `busybox`. Shell into it and try to access the `nginx` service that lives in the `backend` namespace.

Services are accessible from all namespaces as long as you address them using both the name and the namespace.

You can access a service via it's DNS name:
`<servicename>.<namespace>.svc.cluster.local`

```shell
$ kubectl run tmp --image=busybox --restart=Never --rm -it -- wget -O- http://nginx.backend.svc.cluster.local

Connecting to nginx.backend.svc.cluster.local (10.98.157.27:80)
writing to stdout
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
-                    100% |********************************|   612  0:00:00 ETA
written to stdout
pod "tmp" deleted
```