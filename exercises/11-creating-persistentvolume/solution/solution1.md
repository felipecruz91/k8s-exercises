# Solution

Create a YAML file for the Persistent Volume and create it with the command `kubectl create` command.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv
spec:
  capacity:
    storage: 512M
  accessModes:
    - ReadWriteOnce
  storageClassName: shared
  hostPath:
    path: /tmp/config
```

You will see that the Persistent Volume has been created but and is available to be claimed.

```shell
$ kubectl get pv
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv     512M       RWO            Retain           Available           shared                  21s
```

Create a YAML file for the Persistent Volume Claim and create it with the command `kubectl create` command.

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 256M
  storageClassName: shared
```

You will see that the Persisten Volume Claim has been created and has been bound to the Persisten Volume.

```shell
$ kubectl get pvc
NAME   STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc    Bound    pv       512M       RWO            shared         2s

$ kubectl get pv
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM         STORAGECLASS   REASON   AGE
pv     512M       RWO            Retain           Bound    default/pvc   shared                  94s
```

Create a YAML file for the Pod and create it with the command `kubectl create` command.

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: app
  name: app
spec:
  containers:
  - image: nginx
    name: app
    volumeMounts:
      - mountPath: "/data/app/config"
        name: configpvc
    resources: {}
  volumes:
    - name: configpvc
      persistentVolumeClaim:
        claimName: pvc
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```
