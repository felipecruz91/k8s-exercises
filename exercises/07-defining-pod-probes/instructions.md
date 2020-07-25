# Exercise 7

In this exercise, you will create a Pod running a NodeJS application. The Pod will define a readiness probe.

## Defining a Pod’s Readiness

1. Open a new terminal and run the following command in background: `while true; do curl http://localhost:30000; sleep 1; done;`. This command will generate HTTP requests to a NodePort service that will be created in the following step.
2. Create a NodePort service with name `hello-service` that will load balance requests to Pods that are identified by the label `run=hello-deployment`. Configure the NodePort service to listen on the port node `30000` and that routes traffic to the internal service port `3000`, reaching the pods in port `3000`.
3. Create a new Deployment named `hello-deployment` with the image `localhost:32000/nodejs-hello-world:1.0.0` that consists of `3` replicas and exposes the port `3000`. Define an environment variable named `POD_NAME` whose value is the field path `metadata.name`.
4. Apply the deployment and check the HTTP requests from step 1.
5. Scale up the deployment to 10 replicas.
6. Now, delete the previous deployment and modify it to include a Readiness Probe that checks the URL path `/` on the container port `3000` after a `45` seconds delay.
7. Scale up the deployment to 10 replicas and verify that no HTTP requests fail.
8. Scale down the deployment to 3 replicas and verify that no HTTP requests fail.
