# Solution

First, create the namespace.

```shell
$ kubectl create namespace ns2
```

Create the Pod and the two Containers:

```shell
$ kubectl -n ns2 apply -f two-container-pod.yaml
```

Log into the nginx container

```shell
$ kubectl -n ns2 exec -it two-containers -c nginx-container -- /bin/bash

root@two-containers:/# apt-get update
root@two-containers:/# apt-get -y install curl
root@two-containers:/# curl localhost
Hello from the debian container
root@two-containers:/# exit
```

Delete the Pod and namespace after you are done.

```shell
$ kubectl delete pod two-containers --namespace=ns2
pod "two-containers" deleted
$ kubectl delete namespace ns2
namespace "ns2" deleted
```