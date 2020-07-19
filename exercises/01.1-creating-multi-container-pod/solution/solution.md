# Solution

First, create the namespace.

```shell
$ kubectl create namespace ns2
```

Create the Pod and the two Containers:

```shell
$ kubectl -n ns2 apply -f two-container-pod.yaml
```

Find the ip address of the running Pod:

```shell
$ kubectl get pods -o wide
NAME             READY   STATUS    RESTARTS   AGE     IP           NODE             NOMINATED NODE   READINESS GATES
two-containers   2/2     Running   0          4m10s   10.1.62.10   microk8s-node1   <none>           <none>
```

Visit the nginx web server:

```shell
$ curl 10.1.62.10:80
Sun Jul 19 11:57:00 UTC 2020
Sun Jul 19 11:57:01 UTC 2020
Sun Jul 19 11:57:02 UTC 2020
...
```

Delete the Pod and namespace after you are done.

```shell
$ kubectl delete pod two-containers --namespace=ns2
pod "two-containers" deleted
$ kubectl delete namespace ns2
namespace "ns2" deleted
```
