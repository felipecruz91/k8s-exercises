## Define a liveness command


```cli
$ kubectl run liveness-exec --restart=Never --image=busybox \
  --dry-run -o yaml \
  -- /bin/sh -c "touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600" \
  > liveness-exec.yaml
```

Add a liveness probe every 5 seconds. The probe should wait 5 seconds before performing the first check.
**Make sure to remove the `restartPolicy: Never` that was generated autommatically in the yaml file when running the previous imperative command. Otherwise, the liveness probe will not be able to restart the Pod.**

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: liveness-exec
  name: liveness-exec
spec:
  containers:
  - args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    image: busybox
    name: liveness-exec
    resources: {}
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
  dnsPolicy: ClusterFirst
status: {}
```

```cli
$ kubectl apply -f liveness-exec.yaml
```

```cli
$ kubectl describe pod liveness-exec
...
Events:
  Type     Reason     Age                    From                     Message
  ----     ------     ----                   ----                     -------
  Normal   Scheduled  5m52s                  default-scheduler        Successfully assigned default/liveness-exec to microk8s-node1
  Normal   Pulled     3m20s (x3 over 5m51s)  kubelet, microk8s-node1  Successfully pulled image "busybox"
  Normal   Created    3m19s (x3 over 5m51s)  kubelet, microk8s-node1  Created container liveness-exec
  Normal   Started    3m19s (x3 over 5m50s)  kubelet, microk8s-node1  Started container liveness-exec
  Warning  Unhealthy  2m36s (x9 over 5m16s)  kubelet, microk8s-node1  Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory
  Normal   Killing    2m36s (x3 over 5m6s)   kubelet, microk8s-node1  Container liveness-exec failed liveness probe, will be restarted
  Normal   Pulling    51s (x5 over 5m52s)    kubelet, microk8s-node1  Pulling image "busybox"
```

```cli
$ kubectl get pod
NAME            READY   STATUS    RESTARTS   AGE
liveness-exec   1/1     Running   5          6m22s
```

```cli
$ kubectl delete pod liveness-exec
pod "liveness-exec" deleted
```

## Define a liveness HTTP request

```cli
$ kubectl run liveness-http --restart=Never --image=k8s.gcr.io/liveness \
  --dry-run -o yaml -- /server > liveness-http.yaml
```

Add a liveness probe every 3 seconds. The probe should wait 3 seconds before performing the first check.
**Make sure to remove the `restartPolicy: Never` that was generated autommatically in the yaml file when running the previous imperative command. Otherwise, the liveness probe will not be able to restart the Pod.**

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: liveness-http
  name: liveness-http
spec:
  containers:
  - args:
    - /server
    image: k8s.gcr.io/liveness
    name: liveness-http
    resources: {}
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
  dnsPolicy: ClusterFirst
status: {}
```

In the configuration file, you can see that the Pod has a single container. The `periodSeconds` field specifies that the kubelet should perform a liveness probe every 3 seconds. The `initialDelaySeconds` field tells the kubelet that it should wait 3 seconds before performing the first probe.

To perform a probe, the kubelet sends an HTTP GET request to the server that is running in the container and listening on port 8080. If the handler for the server's /healthz path returns a success code, the kubelet considers the container to be alive and healthy. If the handler returns a failure code, the kubelet kills the container and restarts it.
Any code greater than or equal to 200 and less than 400 indicates success. Any other code indicates failure.

For the first 10 seconds that the container is alive, the /healthz handler returns a status of 200. After that, the handler returns a status of 500.

```cli
$ kubectl apply -f liveness-http.yaml
```

```cli
$ kubectl get pods
NAME            READY   STATUS    RESTARTS   AGE
liveness-http   1/1     Running   1          35s
```

```cli
$ kubectl describe pod liveness-http
Events:
  Type     Reason     Age               From                     Message
  ----     ------     ----              ----                     -------
  Normal   Scheduled  43s               default-scheduler        Successfully assigned default/liveness-http to microk8s-node1
  Normal   Pulling    6s (x3 over 42s)  kubelet, microk8s-node1  Pulling image "k8s.gcr.io/liveness"
  Warning  Unhealthy  6s (x6 over 30s)  kubelet, microk8s-node1  Liveness probe failed: HTTP probe failed with statuscode: 500
  Normal   Killing    6s (x2 over 24s)  kubelet, microk8s-node1  Container liveness-http failed liveness probe, will be restarted
  Normal   Pulled     5s (x3 over 41s)  kubelet, microk8s-node1  Successfully pulled image "k8s.gcr.io/liveness"
  Normal   Created    5s (x3 over 41s)  kubelet, microk8s-node1  Created container liveness-http
  Normal   Started    5s (x3 over 41s)  kubelet, microk8s-node1  Started container liveness-http
```
