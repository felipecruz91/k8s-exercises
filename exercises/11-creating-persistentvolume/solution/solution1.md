# Solution

## Create a Persistent Volume
We’re going to create a persistent volume using the StorageClass and PersistentVolumeClaim mechanism, rather than directly creating a Persistent Volume. This is the recommended method for obtaining storage in the most general way when distributing k8s applications.

We’ll first create a new StorageClass, and then create a Persistent Volume Claim that uses the new Storage class.

Create a StorageClass
Storage Classes allow a k8s administrator to categorize storage resources, e.g. “fast” vs “slow”. Storage classes specify a provisioner to use when instantiating volumes. MicroK8s activates the `microk8s.io/hostpath` storage provisioner when the Storage addon has been enabled.

The following `demo-storageclass.yml` file will create a storage class with name demo, using the `microk8s.io/hostpath` storage provisioner.

```shell
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: demo
provisioner: microk8s.io/hostpath
reclaimPolicy: Delete
volumeBindingMode: Immediate
```
Load the storage class yaml file into MicroK8s using the kubectl apply command:

```shell
$ kubectl apply -f demo-storageclass.yml 
storageclass.storage.k8s.io/demo created
```

## Create a Persistent Volume Claim
Pods obtain access to storage via Volumes, which in-turn can be dynamically created using Persistent Volume Claims.

This `demo-persistent-volume-claim.yml` file creates a persistent volume claim named demo-volume-claim. This claim will request 500 megabytes of storage space from the StorageClass named demo that we created in the previous step.

```shell
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name:  demo-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: demo
  resources:
    requests:
      storage: 500M
```
Load the persistent volume claim into MicroK8s using the kubectl apply command:

```shell
$ kubectl apply -f demo-persistent-volume-claim.yml
persistentvolumeclaim/demo-volume-claim created
```

If you enabled the kubernetes dashboard you will see the storage class demo listed and the persistent volume demo as well.

## Access the Persistent Volume
Now that the persistent volume claim has been created, we can create a pod that uses the claim when mounting a volume.

### Create a pod
This `demo-pod.yml` file creates a pod that runs the sleep command. The persistent-volume-claim demo-volume-claim provides a volume that is mounted at /tmp/test

```shell
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: demo
  name: demo
spec:
  volumes:
    - name: demo-storage
      persistentVolumeClaim:
        claimName: demo-volume-claim
  containers:
  - args:
    - sleep
    - "3600"
    image: busybox
    name: demo
    volumeMounts:
      - mountPath: "/tmp/test"
        name: demo-storage
  dnsPolicy: ClusterFirst
  restartPolicy: Never
```
Load the persistent volume claim into MicroK8s using the kubectl apply command:

```shell
$ kubectl apply -f demo-pod.yml 
pod/demo created
```

Verify the volume was mounted into the pod
We can use the kubectl exec command to verify that the pod has access to the demo-volume-claim. Here we’ll execute the df command in the demo pod:

```shell
$ kubectl exec demo -it -- df -h
Filesystem                Size      Used Available Use% Mounted on
overlay                  28.9G      7.4G     21.5G  26% /
tmpfs                    64.0M         0     64.0M   0% /dev
tmpfs                     1.9G         0      1.9G   0% /sys/fs/cgroup
/dev/sda1                28.9G      7.4G     21.5G  26% /tmp/test
/dev/sda1                28.9G      7.4G     21.5G  26% /etc/hosts
/dev/sda1                28.9G      7.4G     21.5G  26% /dev/termination-log
/dev/sda1                28.9G      7.4G     21.5G  26% /etc/hostname
/dev/sda1                28.9G      7.4G     21.5G  26% /etc/resolv.conf
shm                      64.0M         0     64.0M   0% /dev/shm
tmpfs                     1.9G     12.0K      1.9G   0% /var/run/secrets/kubernetes.io/serviceaccounttmpfs                     1.9G         0      1.9G   0% /proc/acpi
tmpfs                    64.0M         0     64.0M   0% /proc/kcore
tmpfs                    64.0M         0     64.0M   0% /proc/keys
tmpfs                    64.0M         0     64.0M   0% /proc/timer_list
tmpfs                    64.0M         0     64.0M   0% /proc/sched_debug
tmpfs                     1.9G         0      1.9G   0% /proc/scsi
tmpfs                     1.9G         0      1.9G   0% /sys/firmware
```

You can see that the mount point `/tmp/test` exists, but interestingly its 28.9 GB, not 500 MB. This happens because the PersistentVolumeClaim specifies the minimum desired volume size. The microk8s.io/hostpath provisioner simply mounts the demo volume in it’s own working folder, which happens to be /var on this system. Therefore the free space shown is that of the /var partition.