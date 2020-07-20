# Solution

## Configuring a Pod to Use a ConfigMap via ENV variables

Create the environment variables in the text file.

```shell
$ echo -e "DB_URL=localhost:3306\nDB_USERNAME=postgres" > config.txt
```

Create the ConfigMap and point to the text file upon creation.

```shell
$ kubectl create configmap db-config --from-env-file=config.txt
configmap/db-config created

$ kubectl run backend --image=nginx --restart=Never -o yaml --dry-run > pod.yaml
```

Load the environment variables from the `db-config` ConfigMap in the `pod.yaml` file. The final YAML file should look similar to the following code snippet.

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: backend
  name: backend
spec:
  containers:
  - image: nginx
    name: backend
    envFrom:
      - configMapRef:
          name: db-config
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

Create the Pod by pointing the `create` command to the YAML file.

```shell
$ kubectl create -f pod.yaml
```

Log into the Pod and run the `env` command.

```shell
$ kubectl exec backend -it -- /bin/sh
# env
DB_URL=localhost:3306
DB_USERNAME=postgres
...
# exit
```

## Optional

> How would you approach hot reloading of values defined by a ConfigMap consumed by an application running in Pod?

Changes to environment variables are only reflected if the Pod is restarted. Alternatively, you can mount a ConfigMap as file and poll changes from the mounted file periodically, however, it requires the application to build in the logic.

## Configuring a Pod to Use a ConfigMap via mounting a volume

```yaml
apiVersion: v1
kind: Pod
metadata:  
  creationTimestamp: null
  labels:    
    run: backend 
    name: backend
spec:
  containers:
  - image: nginx
    name: backend
    volumeMounts:
      - name: config-volume
        mountPath: /etc/config
    resources: {}
  volumes:
    - name: config-volume
      configMap:
        name: db-config
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

Create the Pod by pointing the `create` command to the YAML file.

```shell
$ kubectl create -f pod.yaml
```

List the files under the `/etc/config` directory of the container filesystem:

```shell
$ kubectl exec -it backend -- ls /etc/config
DB_URL  DB_USERNAME
```

### Mounted ConfigMaps are updated automatically
When a ConfigMap already being consumed in a volume is updated, projected keys are eventually updated as well. Kubelet is checking whether the mounted ConfigMap is fresh on every periodic sync. However, it is using its local ttl-based cache for getting the current value of the ConfigMap. As a result, the total delay from the moment when the ConfigMap is updated to the moment when new keys are projected to the pod can be as long as kubelet sync period (1 minute by default) + ttl of ConfigMaps cache (1 minute by default) in kubelet. You can trigger an immediate refresh by updating one of the pod's annotations.
