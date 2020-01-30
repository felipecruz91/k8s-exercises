# Solution

First, create the Pod with the given YAML content.

```shell
$ vim pod.yaml
$ kubectl create -f pod.yaml
```

The Pod seems to be running without problems.

```shell
$ kubectl get pods
NAME          READY   STATUS    RESTARTS   AGE
failing-pod   1/1     Running   0          5s
```

Render the logs of the container. The output should indicate an error message every 5 seconds.

```shell
$ kubectl logs failing-pod
/bin/sh: can't create /root/tmp/curr-date.txt: nonexistent directory
/bin/sh: can't create /root/tmp/curr-date.txt: nonexistent directory
/bin/sh: can't create /root/tmp/curr-date.txt: nonexistent directory
```

Apparently, the directory we want to write to does not exist. You can create a Liveness Probe in order to notify that the container is failing if the directory does not exist.