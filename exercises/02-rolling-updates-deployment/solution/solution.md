# Solution

Generate the YAML for a Deployment plus Pod for further editing.

```shell
$ kubectl run nginx --image=nginx:1.17.9 --restart=Always --replicas=3 --port=80 --dry-run -o yaml > nginx.yaml
```
or

```shell
$ kubectl create deployment nginx:1.17.9 --image=nginx --dry-run -o yaml > nginx.yaml
```

Edit the labels. The selector should match the labels of the Pods. Change the replicas from 1 to 3.

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

Create the deployment by pointing it to the YAML file.

```shell
$ kubectl create -f nginx.yaml
deployment.apps/nginx created
$ kubectl get deployments
NAME     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginx   3         3         3            1           4s
```

Set the new image and check the revision history.

```shell
$ kubectl set image deployment nginx nginx=nginx:1.18
deployment.extensions/nginx image updated

$ kubectl rollout history deployment nginx
deployment.extensions/nginx
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

Find details about revision #2

```shell
$ kubectl rollout history deployment nginx --revision=2
deployment.extensions/nginx with revision #2
Pod Template:
  Labels:       pod-template-hash=6d58f7664f
        run=nginx
  Containers:
   nginx:
    Image:      nginx:1.18
    Port:       80/TCP
    Host Port:  0/TCP
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```

Now scale the Deployment to 5 replicas.

```shell
$ kubectl scale deployment nginx --replicas=5
deployment.extensions/nginx scaled
```

Roll back to revision 1. You will see the new revision. Inspecting the revision should show the image `nginx`.

```shell
$ kubectl rollout undo deployment nginx --to-revision=1
deployment.extensions/nginx

$ kubectl rollout history deployment nginx
deployment.extensions/nginx
REVISION  CHANGE-CAUSE
2         <none>
3         <none>

$ kubectl rollout history deployment nginx --revision=3
deployment.extensions/nginx with revision #3
Pod Template:
  Labels:       pod-template-hash=6cdc894c7c
        run=nginx
  Containers:
   nginx:
    Image:      nginx:1.17.9
    Port:       80/TCP
    Host Port:  0/TCP
    Environment:        <none>
    Mounts:     <none>
  Volumes:      <none>
```

## Optional

> Can you foresee potential issues with a rolling deployment?

A rolling deployment ensures zero downtime which has the side effect of having two different versions of a container running at the same time. This can become an issue if you introduce backward-incompatible changes to your public API. A client might hit either the old or new service API.

> How do you configure a update process that first kills all existing containers with the current version before it starts containers with the new version?

You can configure the deployment use the `Recreate` strategy. This strategy first kills all existing containers for the deployment running the current version before starting containers running the new version.
