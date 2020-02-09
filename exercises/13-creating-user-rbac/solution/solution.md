If using Microk8s, make sure RBAC is enabled in your cluster:

```shell
$ microk8s.enable rbac
```

## Step 1: Create The Office Namespace

Execute the kubectl create command to create the namespace (as the admin user):

```shell
$ kubectl create namespace office
```
## Step 2: Create The User Credentials

Kubernetes does not have API Objects for User Accounts. Of the available ways to manage authentication (see Kubernetes official documentation for a complete list), we will use **OpenSSL certificates** for their simplicity. The necessary steps are:

Create a private key for your user. In this example, we will name the file `employee.key`:

```shell
$ openssl genrsa -out employee.key 2048
```

Create a certificate sign request `employee.csr` using the private key you just created (`employee.key` in this example). Make sure you specify your username and organization in the -subj section (CN is for the username and O for the organization). As previously mentioned, we will use `employee` as the name and `mycompany` as the organization:

```shell
$ openssl req -new -key employee.key -out employee.csr -subj "/CN=employee/O=mycompany"
```

⚠️ If you have the following error:

    Can't load /home/<YOUR-USER>/.rnd into RNG
    139996036313536:error:2406F079:random number generator:RAND_load_file:Cannot open file:../crypto/rand/randfile.c:88:Filename=/home/<YOUR-USER>/.rnd

You can solve it by removing (or commenting out) the line `RANDFILE = $ENV::HOME/.rnd` from `/etc/ssl/openssl.cnf`.

Locate your Kubernetes cluster certificate authority (CA). This will be responsible for approving the request and generating the necessary certificate to access the cluster API. In the case of Microk8s, X509 Client Certs with the client CA file set to `/var/snap/microk8s/current/certs`.

Check that the files `ca.crt` and `ca.key` exist in the location.

Generate the final certificate `employee.crt` by approving the certificate sign request, `employee.csr`, you made earlier. Make sure you substitute the `CA_LOCATION` placeholder with the location of your cluster CA. In this example, the certificate will be valid for 500 days:

```shell
$ openssl x509 -req -in employee.csr -CA CA_LOCATION/ca.crt -CAkey CA_LOCATION/ca.key -CAcreateserial -out employee.crt -days 500
```

Save both `employee.crt` and `employee.key` in a safe location.

Add a new context with the new credentials for your Kubernetes cluster.

```shell
$ kubectl config set-credentials employee --client-certificate=<your-path>/employee.crt  --client-key=<your-path>/employee.key

$ kubectl config set-context employee-context --cluster=microk8s-cluster --namespace=office --user=employee
```

Now you should get an access denied error when using the kubectl CLI with this configuration file. This is expected as we have not defined any permitted operations for this user.

```shell
$ kubectl --context=employee-context get pods

Error from server (Forbidden): pods is forbidden: User "employee" cannot list resource "pods" in API group "" in the namespace "office"
```

## Step 3: Create The Role For Managing Deployments

Create a `role-deployment-manager.yaml` file with the content below. In this yaml file we are creating the rule that allows a user to execute several operations on Deployments, Pods and ReplicaSets (necessary for creating a Deployment), which belong to the core (expressed by "" in the yaml file), apps, and extensions API Groups:

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  namespace: office
  name: deployment-manager
rules:
- apiGroups: ["", "extensions", "apps"]
  resources: ["deployments", "replicasets", "pods"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"] # You can also use ["*"]
```

Create the Role in the cluster using the kubectl create role command:

```shell
$ kubectl create -f role-deployment-manager.yaml
```

You can see the description of the new role you just created:

```shell
$ kubectl -n office describe role deployment-manager

Name:         deployment-manager
Labels:       <none>
Annotations:  <none>
PolicyRule:
  Resources               Non-Resource URLs  Resource Names  Verbs
  ---------               -----------------  --------------  -----
  deployments             []                 []              [get list watch create update patch delete]
  pods                    []                 []              [get list watch create update patch delete]
  replicasets             []                 []              [get list watch create update patch delete]
  deployments.apps        []                 []              [get list watch create update patch delete]
  pods.apps               []                 []              [get list watch create update patch delete]
  replicasets.apps        []                 []              [get list watch create update patch delete]
  deployments.extensions  []                 []              [get list watch create update patch delete]
  pods.extensions         []                 []              [get list watch create update patch delete]
  replicasets.extensions  []                 []              [get list watch create update patch delete]
```

## Step 4: Bind The Role To The Employee User

Create a `rolebinding-deployment-manager.yaml` file with the content below. In this file, we are binding the deployment-manager Role to the User Account `employee` inside the `office` namespace:

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: deployment-manager-binding
  namespace: office
subjects:
- kind: User
  name: employee
  apiGroup: ""
roleRef:
  kind: Role
  name: deployment-manager
  apiGroup: ""
```

Deploy the RoleBinding by running the kubectl create command:

```shell
$ kubectl create -f rolebinding-deployment-manager.yaml
```

You can see the description of the new role you just created:

```shell
$ kubectl -n office describe rolebinding deployment-manager-binding 
Name:         deployment-manager-binding
Labels:       <none>
Annotations:  <none>
Role:
  Kind:  Role
  Name:  deployment-manager
Subjects:
  Kind  Name      Namespace
  ----  ----      ---------
  User  employee
```

## Step 5: Test The RBAC Rule

Now you should be able to execute the following commands without any issues:

```shell
$ kubectl --context=employee-context run --image bitnami/dokuwiki mydokuwiki

$ kubectl --context=employee-context get pods
```

If you run the same command with the `--namespace=default` argument, it will fail, as the employee user does not have access to this namespace.

```shell
$ kubectl --context=employee-context get pods --namespace=default

Error from server (Forbidden): pods is forbidden: User "employee" cannot list resource "pods" in API group "" in the namespace "default"
```

Now you have created a user with limited permissions in your cluster 🚀