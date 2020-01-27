# Exercise 5

In this exercise, you will first create a ConfigMap from predefined values in a file. Later, you'll create a Pod, consume the ConfigMap as environment variables and print out its values from within the container. Finally, you will create another pod that will mount the configmap as a volume.

## Configuring a Pod to Use a ConfigMap via ENV variables

1. Create a new file named `config.txt` with the following environment variables as key/value pairs on each line.

- `DB_URL` equates to `localhost:3306`
- `DB_USERNAME` equates to `postgres`

2. Create a new ConfigMap named `db-config` from that file.
3. Create a Pod named `backend` that uses the environment variables from the ConfigMap and runs the container with the image `nginx`.
4. Shell into the Pod and print out the created environment variables. You should find `DB_URL` and `DB_USERNAME` with their appropriate values.
5. (Optional) Discuss: How would you approach hot reloading of values defined by a ConfigMap consumed by an application running in Pod?

## Configuring a Pod to Use a ConfigMap via mounting a volume

1. Reusing the existing `db-config` config map, define a volume in the Pod specification with name `config-volume`. Reference the `db-config` config map. 
2. In the `backend` container, mount a volume in the path `/etc/config`.
3. Shell into the Pod and print out the files under the `/etc/config` directory. You s hould find `DB_URL` and `DB_USERNAME` with their appropiate values.
