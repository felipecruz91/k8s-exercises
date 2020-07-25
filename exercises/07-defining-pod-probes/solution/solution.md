# Solution

You need to have the `registry` feature in Microk8s. You can enable using:

```shell
$ microk8s.enable registry
```

Upload your image to the local registry that Microk8s has running:

```shell
$ docker tag nodejs-hello-world:1.0.0 localhost:32000/nodejs-hello-world:1.0.0
$ docker push localhost:32000/nodejs-hello-world:1.0.0
```

Open a new terminal and run the following command in background. This command will generate HTTP requests to a NodePort service that will be created in the following step.

```cli
$ while true; do curl http://localhost:30000; sleep 1; done;
```

Create a NodePort service with name `hello-service` that will load balance requests to Pods that are identified by the label `run=hello-deployment`. Configure the NodePort service to listen on the port node `30000` and that routes traffic to the internal service port `3000`, reaching the pods in port `3000`.

```cli
$ kubectl create service nodeport hello-service --node-port=30000 --tcp=3000:3000 --dry-run -o yaml > hello-service.yaml
```

```cli
$ kubectl apply -f hello-service.yaml
```

Create a new Deployment named `hello-deployment` with the image `localhost:32000/nodejs-hello-world:1.0.0` that consists of `3` replicas and exposes the port `3000`. Define an environment variable named `POD_NAME` whose value is the field path `metadata.name`.

```
$ kubectl run hello-deployment --restart=Always --image=localhost:32000/nodejs-hello-world:1.0.0 --replicas=3 --port=3000 --dry-run -o yaml > hello-deployment.yaml
```

```cli
$ kubectl apply -f hello-deployment.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    run: hello-deployment
  name: hello-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      run: hello-deployment
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: hello-deployment
    spec:
      containers:
      - image: localhost:32000/nodejs-hello-world:1.0.0
        name: hello-deployment
        ports:
        - containerPort: 3000
	env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
        resources: {}
status: {}
```

You should start seeing requests going to the pods of the deployment through the NodePort service:

```cli
...
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
Hello World from pod hello-deployment-7dd7b5fd5-bs245
Hello World from pod hello-deployment-7dd7b5fd5-jr9f8
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
...
```

Scale the deployment to 10 replicas.

```cli
$ kubectl scale deployment hello-deployment --replicas=10
deployment.extensions/hello-deployment scaled
```

Because the NodeJS server takes 40 seconds to start (this was made on purpose), and the Pod has no readiness probe configured, the requests will be routed from the NodePort service to the Pods of the deployment (even though they are not ready to serve traffic yet!)
This implies that you have requests that are failing to be served by the NodeJS server.

```cli
...
Hello World from pod hello-deployment-7dd7b5fd5-bs245
Hello World from pod hello-deployment-7dd7b5fd5-jr9f8
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
curl: (52) Empty reply from server
Hello World from pod hello-deployment-7dd7b5fd5-bs245
Hello World from pod hello-deployment-7dd7b5fd5-jr9f8
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
curl: (56) Recv failure: Connection reset by peer
Hello World from pod hello-deployment-7dd7b5fd5-bs245
Hello World from pod hello-deployment-7dd7b5fd5-jr9f8
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
curl: (56) Recv failure: Connection reset by peer
Hello World from pod hello-deployment-7dd7b5fd5-bs245
Hello World from pod hello-deployment-7dd7b5fd5-jr9f8
Hello World from pod hello-deployment-7dd7b5fd5-qlwql
curl: (56) Recv failure: Connection reset by peer
Hello World from pod hello-deployment-7dd7b5fd5-bs245
```

Once the 40 seconds have elapsed, you will stop seeing those error messages as the NodeJS server will start serving HTTP requests.

Let's delete the deployment and make a fix for this.

```cli
$ kubectl delete deploy hello-deployment
deployment.extensions "hello-deployment" deleted
```

Create a new deployment that includes a Readiness Probe that checks the URL path `/` on the container port `3000` after a `45` seconds delay.

```cli
$ cp hello-deployment.yaml hello-deployment-with-probe.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    run: hello-deployment
  name: hello-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      run: hello-deployment
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: hello-deployment
    spec:
      containers:
      - image: localhost:32000/nodejs-hello-world:1.0.0
        name: hello-deployment
        ports:
        - name: nodejs-port
          containerPort: 3000
        readinessProbe:
          httpGet:
            path: /
            port: nodejs-port
          initialDelaySeconds: 45
        env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
        resources: {}
status: {}
```

```cli
$ kubectl apply -f hello-deployment-with-probe.yaml
deployment.apps/hello-deployment created
```

Notice how now, unlike before, the NodePort service routes traffic to the Pods of the deployment only once the readiness check has passed for each one of them, resulting in no failed HTTP requests.

```cli
...
Hello World from pod hello-deployment-58bb6fd547-xv9zx
Hello World from pod hello-deployment-58bb6fd547-trw44
Hello World from pod hello-deployment-58bb6fd547-wsxjm
Hello World from pod hello-deployment-58bb6fd547-xv9zx
Hello World from pod hello-deployment-58bb6fd547-trw44
Hello World from pod hello-deployment-58bb6fd547-wsxjm
Hello World from pod hello-deployment-58bb6fd547-xv9zx
Hello World from pod hello-deployment-58bb6fd547-trw44
Hello World from pod hello-deployment-58bb6fd547-wsxjm
Hello World from pod hello-deployment-58bb6fd547-xv9zx
Hello World from pod hello-deployment-58bb6fd547-trw44
Hello World from pod hello-deployment-58bb6fd547-wsxjm
Hello World from pod hello-deployment-58bb6fd547-xv9zx
Hello World from pod hello-deployment-58bb6fd547-trw44
Hello World from pod hello-deployment-58bb6fd547-wsxjm
Hello World from pod hello-deployment-58bb6fd547-xv9zx
...
```
