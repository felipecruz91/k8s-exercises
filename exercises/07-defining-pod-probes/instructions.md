# Exercise 7

In this exercise, you will create a Pod running a NodeJS application. The Pod will define readiness and liveness probes with different parameters.

## Defining a Pod’s Readiness and Liveness Probe

1. Create a new Pod named `hello` with the image `localhost:32000/nodejs-hello-world:1.0.0` that exposes the port 3000. Provide the name `nodejs-port` for the container port.
2. Add a Readiness Probe that checks the URL path / on the port referenced with the name `nodejs-port` after a 45 seconds delay. You do not have to define the period interval.
3. Add a Liveness Probe that verifies that the app is up and running every 8 seconds by checking the URL path / on the port referenced with the name `nodejs-port`. The probe should start with a 5 seconds delay.
4. Find the Pod IP address and curl `localhost:3000` every second.
5. Retrieve the logs from the container.