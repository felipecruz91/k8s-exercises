# Exercise 13

## Create User With Limited Namespace Access

In this example, we will create the following User Account:

```
Username: employee
Organization: mycompany
```
We will add the necessary RBAC policies so this user can fully manage deployments (i.e. use `kubectl run` command) only inside the office namespace. At the end, we will test the policies to make sure they work as expected.

Steps:

1. Create certificates for the user.
2. Create a certificate sign request.
3. Sign the certificate with the cluster certificate authority.
4. Create a configuration for your user.
5. Add RBAC rules for this user or its group.
