# Solution

You need to have enabled the metrics-server in Microk8s: 
```shell
$ microk8s.enable metrics-server
```

Generate the YAML for a Deployment plus Pod for further editing.

```shell
$ kubectl run my-deploy --image=polinux/stress --replicas=1 \
  --requests=cpu="100m" --limits=cpu="100m" \
  --dry-run -o yaml \
  -- stress --cpu 1  --io 1 --vm 1 --vm-bytes 12M --timeout 20000s > my-deploy.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    run: my-deploy
  name: my-deploy
spec:
  replicas: 1
  selector:
    matchLabels:
      run: my-deploy
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: my-deploy
    spec:
      containers:
      - args:
        - stress
        - --cpu
        - "1"
        - --io
        - "1"
        - --vm
        - "1"
        - --vm-bytes
        - 12M
        - --timeout
        - 20000s
        image: polinux/stress
        name: my-deploy
        resources:
          limits:
            cpu: 100m
          requests:
            cpu: 100m
status: {}
```

Verify the Pod resource requests and limits are set to 100 millicores

```yaml
spec:
        ...
        image: polinux/stress
        name: my-deploy        
        resources:
          limits:
            cpu: 100m
          requests:
            cpu: 100m
```

Create the deployment by pointing it to the YAML file.

```shell
$ kubectl apply -f my-deploy.yaml
deployment.apps/nginx created
$ kubectl get deployments
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
my-deploy   1/1     1            1           11s
```

Wait for the metrics-server to collect CPU metrics from the Pod:

```shell
$ kubectl top pod my-deploy-66f7646847-g4llp 
NAME                         CPU(cores)   MEMORY(bytes)   
my-deploy-66f7646847-g4llp   909m         5Mi
```

Create an autoscaler that maints between 1 and 6 replicas of the Pods controlled by the `my-deploy` deployment.

```shell
$ kubectl autoscale deployment my-deploy --min=1 --max=6 --cpu-percent=70

$ kubectl get hpa my-deploy
NAME        REFERENCE              TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
my-deploy   Deployment/my-deploy   <unknown>/70%   1         6         0          9s

$ kubectl describe hpa my-deploy

Events:
  Type    Reason             Age   From                       Message
  ----    ------             ----  ----                       -------
  Normal  SuccessfulRescale  24s   horizontal-pod-autoscaler  New size: 4; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  9s    horizontal-pod-autoscaler  New size: 6; reason: cpu resource utilization (percentage of request) above target
```

Eventually, it will scale up to 6 replicas:

```shell
$ watch kubectl get all

Every 2.0s: kubectl get all                                                                                                                                              microk8s-node1: Sun Jul 19 15:56:18 2020

NAME                             READY   STATUS    RESTARTS   AGE
pod/my-deploy-64f59795b4-464b9   1/1     Running   0          16m
pod/my-deploy-64f59795b4-6bxxd   1/1     Running   0          13m
pod/my-deploy-64f59795b4-86d6w   1/1     Running   0          11m
pod/my-deploy-64f59795b4-nqrz2   1/1     Running   0          15m
pod/my-deploy-64f59795b4-tgk92   1/1     Running   0          13m
pod/my-deploy-64f59795b4-xktqz   1/1     Running   0          22m

NAME                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.152.183.1   <none>        443/TCP   114m

NAME                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-deploy   6/6     6            6           22m

NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/my-deploy-64f59795b4   6         6         6       22m

NAME                                            REFERENCE              TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/my-deploy   Deployment/my-deploy   99%/70%   1         6         6          17m
```
