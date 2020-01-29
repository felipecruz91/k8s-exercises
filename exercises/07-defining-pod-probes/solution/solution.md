# Solution

You need to have the `registry` feature in Microk8s. You can enable using:

```shell
$ microk8s.enable registry
```

Upload your image to the local registry that Microk8s has running:

```shell
$ docker tag webapp:optimized localhost:32000/nodejs-hello-world:1.0.0
$ docker push localhost:32000/nodejs-hello-world:1.0.0
```

Create the intial YAML with the following command.

```shell
$ kubectl run hello --image=localhost:32000/nodejs-hello-world:1.0.0 --restart=Never --port=3000 -o yaml --dry-run > pod.yaml
```

Edit the YAML file and add the probes.

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: hello
  name: hello
spec:
  containers:
  - image: localhost:32000/nodejs-hello-world:1.0.0
    name: hello
    ports:
    - name: nodejs-port
      containerPort: 3000
    readinessProbe:
      httpGet:
        path: /
        port: nodejs-port
      initialDelaySeconds: 45
    livenessProbe:
      httpGet:
        path: /
        port: nodejs-port
      initialDelaySeconds: 5
      periodSeconds: 8
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

Create the Pod from the YAML file, find out the Pod IP address and in a new terminal window execute the `curl` command every second:

```shell
$ kubectl create -f pod.yaml
pod/hello created
$ while true; do curl http://<POD_IP_ADDRESS>:3000/; sleep 1; done

curl: (7) Failed to connect to 10.1.1.63 port 3000: Connection refused
curl: (7) Failed to connect to 10.1.1.63 port 3000: Connection refused
curl: (7) Failed to connect to 10.1.1.63 port 3000: Connection refused
curl: (7) Failed to connect to 10.1.1.63 port 3000: Connection refused
(After ~45 seconds the NodeJS web server will start serving requests)
Hello World
Hello World
Hello World
Hello World
