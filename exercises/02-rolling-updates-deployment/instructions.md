# Exercise 02

In this exercise, you will create a Deployment with multiple replicas. After inspecting the Deployment, you will update its parameters. Furthermore, you will use the rollout history to roll back to a previous revision.

## Performing Rolling Updates for a Deployment

1. Create a Deployment named `nginx-deployment` that creates a ReplicaSet of 3 pods running a container with the image `nginx:1.7.9`. The container name should be `nginx` and expose the port `80`.
2. List the Deployment and ensure that the correct number of replicas is running.
3. Let's update the nginx Pods to use the `nginx:1.9.1` image instead of the `nginx:1.7.9` image.
4. Verify that the change has been rolled out to all replicas and that a new replica set has been created.
5. Imagine you're about to make a mistake when updating the Deployment, setting the new image field to `nginx:1.91` instead of `nginx:1.9.1`. Verify the deployment gets stuck and it cannot move forward.
6. Have a look at the Deployment rollout history.
7. Revert the Deployment to revision 2.
8. Scale the Deployment to 5 replicas.
9. Pause the deployment and then update the image of the deployment to `nginx:1.9.1`. Verify no new deployment has been triggered.
10. Resume the deployment and verify a new ReplicaSet has been created with the previous changes.
11. (Optional) Discuss: Can you foresee potential issues with a rolling deployment? How do you configure an update process that first kills all existing containers with the current version before it starts containers with the new version?
