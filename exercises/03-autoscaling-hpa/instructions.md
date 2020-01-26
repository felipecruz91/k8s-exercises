# Exercise 03

In this exercise, you will configure the Horizontal Pod Autoscaler (HPA) to kick off when Pods of a Deployment exceed the CPU threshold configured.

You need to have enabled the metrics-server in Microk8s: 
```shell
$ microk8s.enable metrics-server
```

## Automatically scale a deployment

1. Create a Deployment named `my-deploy` with only 1 replica initially. The Pod should use the `polinux/stress` image and run the command `stress --cpu 1 --timeout 2000s`. This will simulate a CPU consumption of 1 core in the Pod.
Save the deployment configuration to the `my-deploy.yaml` file.

2. Edit the `my-deploy.yaml` deploy yaml and set the Pod resource requests 100 millicores. Apply the configuration.

3. List the Deployment and ensure that the correct number of replicas is running: 1 replica.

4. Wait for Pod metrics to be collected.

5. Create an autoscaler that maints between 1 and 6 replicas of the Pods controlled by the `my-deploy` deployment you created in step 1. You have to try to maintain an average CPU utilization across all Pods of 70%.