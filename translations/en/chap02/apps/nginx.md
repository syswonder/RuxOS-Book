# Nginx

RuxOS supports running  [Nginx](https://www.nginx.com/)build servers on Qemu.

First, it's necessary to ensure that the Nginx application exists in the `apps/c/nginx` directory of RuxOS. If it's not there, you can download the Nginx application by running the following code in the root directory of RuxOS:

```shell
git clone https://github.com/syswonder/rux-nginx.git ./apps/c/nginx
```

## Creating a File System Image

When running, it is necessary to ensure the following files exist in the file system:

`/nginx/logs/error.log`

`/nginx/conf/nginx.conf`

`/nginx/conf/mime.types`

Among these, `error.log` is a log file (although it's actually not used), `nginx.conf` is the Nginx configuration file, which tells Nginx how to operate and some operational parameters. `mime.types` is a file type conversion file, informing Nginx how to treat different types of files.

If there is no disk.img in the root directory of RuxOS, an appropriate img will be automatically created during runtime.

If you want to regenerate the image, you can run the create_nginx_img.sh script in the apps/c/nginx directory.

## Creating Web Page Files

By default, when running, the `apps/c/nginx` directory needs to have a folder named html to load the web pages of the Nginx server. If you do not want to use your own web pages, you can run the following command to add files to the html folder:

```shell
git clone https://github.com/syswonder/syswonder-web.git
mkdir -p apps/c/nginx/html
cp -r syswonder-web/docs/* apps/c/nginx/html
rm -f -r syswonder-web
```

Web page files can also be set in other paths, see below for details about nginx.conf and 9p.

## Running Nginx

After completing the steps above, run the following command to start the Nginx server on port 5555.

```shell
make A=apps/c/nginx/ LOG=info NET=y BLK=y ARCH=aarch64 SMP=4 run
```

Parameter explanation:

`A`: This parameter points to the directory where the Nginx application is located.
`LOG`: LOG denotes the log level of the output, with lower log levels meaning more detailed output. Options include: error, warn, info, debug, trace.
`NET`: This parameter enables qemu's virtio-net.
`BLK:` This parameter enables qemu's virtio-blk.
`ARCH`: ARCH indicates which architecture RuxOS is running on, with architectural options including: x86_64, aarch64, riscv64.
`SMP`: SMP enables the multi-core feature of RuxOS, with the number following it indicating the number of cores to launch.
Note, if you have modified the source code or run parameters after the first run, please run the following command to clean up the application files:

```shell
make clean_c A=apps/c/nginx
```

## How to Connect and Test

You can access the web page when visiting the server's port 5555.

![nginx_res](img/nginx-res.png)

## Using Musl libc

By default, RuxOS's Nginx uses a custom C application, ruxlibc.

By adding `MUSL=y` to the run command, you can use the standard musl libc integrated with RuxOS for compilation and linking.

## Using 9pfs

By default, RuxOS passes arguments to applications through the ARGS parameter in the command line, which may be inconvenient. RuxOS has now successfully integrated 9pfs, used for sharing file directories between the host and qemu, so parameters can be passed through the application's own configuration file.

Run the following command:

```shell
make A=apps/c/nginx/ LOG=info NET=y BLK=y FEATURES=virtio-9p V9P=y V9P_PATH=./apps/c/nginx/html/ ARCH=aarch64 SMP=4 run
```

Parameter explanation:

`V9P`: Use V9P=y to enable qemu's virtio-9p backend.
`FEATURES=virtio-9p`: Tells RuxOS to enable the 9p feature.
`V9P_PATH`: V9P_PATH points to the directory on the host that is shared, by default this is the location of the web page files.

## nginx.conf

You can modify the nginx.conf file in the apps/c/nginx directory to change the configuration of Nginx, including changing server functions, modifying server parameters, changing Nginx operation options, etc.

Note:

- Functions other than the http server have not been verified.

  

- If you modify server parameters (such as ports), please make corresponding changes to qemu's respective settings (such as port mapping).

  

- After modifying nginx.conf, please copy it to the file system image. You can do this by running ./create_nginx_img.sh in the apps/c/nginx directory.

  

- The nginx.conf used with 9pfs will be different, its content is in apps/c/nginx/nginx_9p.conf. You can copy it to the file system image using the command ./create_nginx_img.sh 9p.