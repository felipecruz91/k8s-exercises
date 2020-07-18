# Exercise 1.1

In this exercise, you will practice the creation of a new multi-container Pod in a namespace. Once created, you will inspect it, shell into it and run some operations inside of the container.

The primary reason that Pods can have multiple containers is to support helper applications that assist a primary application. Typical examples of helper applications are data pullers, data pushers, and proxies. Helper and primary applications often need to communicate with each other. Typically this is done through a shared filesystem, as shown in this exercise, or through the loopback network interface, localhost. An example of this pattern is a web server along with a helper program that polls a Git repository for new updates.

The Volume in this exercise provides a way for Containers to communicate during the life of the Pod. If the Pod is deleted and recreated, any data stored in the shared Volume is lost.

## Creating a Pod and Inspecting it

1. Create the namespace `ns2`.
2. In the namespace `ns2` create a new Pod named `two-containers` with a first `nginx-container` container with the image `nginx`. Expose the port 80 and save the Pod configuration into a file named `two-containers-pod.yaml`
3. Edit the file and add a new container to the Pod. The new container name is `debian-container` and uses the image `debian` and it will execute the following command:
 `echo Hello from the debian container > /pod-data/index.html`

4. Use a volume to share the `index.html` file.
10. Delete the Pod and the namespace.
