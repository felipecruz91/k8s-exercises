# Exercise 10

In this exercise, you will practice how to establish communication among pods that exist in different namespaces.

## Creating a Deployment and accessing its pods from a different namespace

1. Create the namespace `backend`.
2. In the namespace `backend` create a new Deployment with name `nginx` that consists of 3 replicas with the image `nginx`. Expose the container port 80.
3. Expose the deployment by creating a `ClusterIP` service on port `80`.
4. Create the namespace `frontend`
5. Deploy a Pod with the name `tmp` and container image `busybox`. From the `tmp` Pod in the `frontend` namespace, try to access the `nginx` service that lives in the `backend` namespace.
