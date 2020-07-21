# Solution

Generate the YAML for a Deployment plus Pod for further editing.

```shell
$ kubectl run nginx-deployment --image=nginx:1.17.9 --restart=Always --replicas=3 --port=80 --dry-run -o yaml > nginx-deployment.yaml
```
or

```shell
$ kubectl create deployment nginx-deployment --image=nginx:1.17.9 --dry-run -o yaml > nginx-deployment.yaml
```

Verify the number of `replicas` of the deployment is set to `3` and set the container name to `nginx`.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    run: nginx
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      run: nginx
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: nginx
    spec:
      containers:
      - image: nginx:1.17.9
        name: nginx
        ports:
        - containerPort: 80
        resources: {}
status: {}
```

Create the deployment by using the YAML manifest.

```shell
$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx-deployment created
```
Visualize the deployments.

```shell
$ kubectl get deployments
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           14s
```
Visualize the replica sets.

```shell
$ kubectl get replicasets
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-75bc85768f   3         3         3       2m9s
```
Let's update the nginx Pods to use the `nginx:1.9.1` image instead of the `nginx:1.7.9` image.

```shell
$ kubectl set image deployment nginx-deployment nginx=nginx:1.9.1 --record
deployment.extensions/nginx-deployment image updated
```

Verify the deployment has been rolled out successfully:

```shell
$ kubectl rollout status deployment nginx-deployment
deployment "nginx-deployment" successfully rolled out
```
And that a new replica set has been generated:

```shell
$ kubectl get replicasets
NAME                          DESIRED   CURRENT   READY   AGE
nginx-deployment-75bc85768f   0         0         0       5m
nginx-deployment-7d6c755c58   3         3         3       86s
```

Make a new deployment update by setting the container image to `nginx:1.91` instead of `nginx:1.9.1`. Verify the deployment gets stuck and it cannot move forward.

```shell
$ kubectl set image deployment nginx-deployment nginx=nginx:1.91 --record
deployment.extensions/nginx-deployment image updated
```

```shell
$ kubectl rollout status deployment nginx-deployment
Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
```
As you can see the deployment cannot move forward so press Ctrl+C to cancel the **monitoring** of the deployment (this will not cancel the deployment).

Have a look at the Deployment rollout history.

```shell
$ kubectl rollout history deployment nginx-deployment
deployment.extensions/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
2         kubectl set image deployment nginx-deployment nginx=nginx:1.9.1 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=true
3         kubectl set image deployment nginx-deployment nginx=nginx:1.91 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=true
```

Find more details about revision #2

```shell
$ kubectl rollout history deployment nginx-deployment --revision=2
deployment.extensions/nginx-deployment with revision #2
Pod Template:
  Labels:       pod-template-hash=7d6c755c58
        run=nginx-deployment
  Annotations:  kubernetes.io/change-cause:
          kubectl set image deployment nginx-deployment nginx=nginx:1.9.1 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=tr...
  Containers:
   nginx:
    Image:      nginx:1.9.1
    Port:       80/TCP
    Host Port:  0/TCP
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```

Revert the Deployment to revision 2.

```shell
$ kubectl rollout undo deployment nginx-deployment --to-revision=2
deployment.extensions/nginx-deployment
REVISION  CHANGE-CAUSE
1         <none>
3         kubectl set image deployment nginx-deployment nginx=nginx:1.91 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=true
4         kubectl set image deployment nginx-deployment nginx=nginx:1.9.1 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=true
```

To find out more about the details of the rollout, use `kubectl describe`:

```shell
$ kubectl describe deployment nginx-deployment
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Tue, 21 Jul 2020 07:37:28 +0000
Labels:                 run=nginx-deployment
Annotations:            deployment.kubernetes.io/revision: 4
                        kubectl.kubernetes.io/last-applied-configuration:
                          {"apiVersion":"apps/v1","kind":"Deployment","metadata":{"annotations":{},"creationTimestamp":null,"labels":{"run":"nginx-deployment"},"nam...
                        kubernetes.io/change-cause:
                          kubectl set image deployment nginx-deployment nginx=nginx:1.9.1 --kubeconfig=/var/snap/microk8s/1120/credentials/client.config --record=tr...
Selector:               run=nginx-deployment
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  run=nginx-deployment
  Containers:
   nginx:
    Image:        nginx:1.9.1
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-7d6c755c58 (3/3 replicas created)
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  4m7s   deployment-controller  Scaled up replica set nginx-deployment-75bc85768f to 3
  Normal  ScalingReplicaSet  3m54s  deployment-controller  Scaled up replica set nginx-deployment-7d6c755c58 to 1
  Normal  ScalingReplicaSet  3m53s  deployment-controller  Scaled down replica set nginx-deployment-75bc85768f to 2
  Normal  ScalingReplicaSet  3m53s  deployment-controller  Scaled up replica set nginx-deployment-7d6c755c58 to 2
  Normal  ScalingReplicaSet  3m52s  deployment-controller  Scaled down replica set nginx-deployment-75bc85768f to 1
  Normal  ScalingReplicaSet  3m52s  deployment-controller  Scaled up replica set nginx-deployment-7d6c755c58 to 3
  Normal  ScalingReplicaSet  3m51s  deployment-controller  Scaled down replica set nginx-deployment-75bc85768f to 0
  Normal  ScalingReplicaSet  3m32s  deployment-controller  Scaled up replica set nginx-deployment-67bdd98d96 to 1
  Normal  ScalingReplicaSet  69s    deployment-controller  Scaled down replica set nginx-deployment-67bdd98d96 to 0
```

Now scale the Deployment to 5 replicas.

```shell
$ kubectl scale deployment nginx-deployment --replicas=5
deployment.extensions/nginx-deployment scaled
```

Pause the deployment and then update the image of the deployment to `nginx:1.9.1`. Verify no new deployment has been triggered.

```shell
$ kubectl rollout pause deployment nginx-deployment
deployment.extensions/nginx-deployment paused
```

```shell
$ kubectl set image deployment nginx-deployment nginx=nginx:1.91 --record
deployment.extensions/nginx-deployment image updated
```

Resume the deployment and verify a new ReplicaSet has been created with the previous changes.

```shell
$ kubectl rollout resume deployment nginx-deployment
deployment.extensions/nginx-deployment resumed
```

## Optional

> Can you foresee potential issues with a rolling deployment?

A rolling deployment ensures zero downtime which has the side effect of having two different versions of a container running at the same time. This can become an issue if you introduce backward-incompatible changes to your public API. A client might hit either the old or new service API.

> How do you configure a update process that first kills all existing containers with the current version before it starts containers with the new version?

You can configure the deployment use the `Recreate` strategy. This strategy first kills all existing containers for the deployment running the current version before starting containers running the new version.
