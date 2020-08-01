# Exercise 11

In this exercise, you will create a PersistentVolume, connect it to a PersistentVolumeClaim and mount the claim to a specific path of a Pod.

## 1. Defining and Mounting a PersistentVolume

1. Create a directory in your host where to persist the data, i.e: `/tmp/config`.
2. Create a Persistent Volume named `pv`, access mode `ReadWriteMany`, storage class name `shared`, 512MB of storage capacity and the host path `/tmp/config`.
3. Create a Persistent Volume Claim named `pvc` that requests the Persistent Volume in step 2. The claim should request 256MB. Ensure that the Persistent Volume Claim is properly bound after its creation.
4. Mount the Persistent Volume Claim from a new Pod named `app` with the path `/data/app/config`. The Pod uses the image `nginx`.
5. Check the events of the Pod after starting it to ensure that the Persistent Volume was mounted properly.

## 2. Create a Persistent Volume dynamically

1. Create a storage class with name `demo`, being `microk8s.io/hostpath` the default provisioner.
2. Create a Persistent Volume Claim (PVC) that requests 500M of storage from the StorageClass `demo` created in the previous step. The Access Mode should be set to `ReadWriteOnce`
3. Verify both the Persistent Volume (PV) and the Persistent Volume Claim (PVC) has been created and they are bounded.
4. Create a Pod under the name `demo` which uses the `busybox` image and runs the command `sleep 3600`. Define the PVC in the Pod and mount it at the container path `/tmp/test`
5. Verify the volume was mounted into the Pod by inspecting the amount of disk available with the command `df -h`
