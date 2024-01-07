# Redis

RuxOS supports running the [Redis](https://github.com/redis/redis) server on Qemu.

## Clone the Redis Directory

Run:

```bash
git clone https://github.com/syswonder/rux-redis ./apps/c/redis/
```

This command will clone the makefile and patch files related to Redis into the `apps/c/redis` directory.

## Create File System Image

Run the following command in the RuxOS root directory:

```shell
make disk_img
```

This command generates a file system (FATFS) image `disk.img` in the root directory to be passed to Qemu.

## Run Redis-Server

Run the following command to start the Redis server on port 5555:

```shell
make A=apps/c/redis/ LOG=error NET=y BLK=y ARCH=aarch64 SMP=4 ARGS="./redis-server,--bind,0.0.0.0,--port,5555,--save,\"\",--appendonly,no,--protected-mode,no,--ignore-warnings,ARM64-COW-BUG" run
```

Parameter explanation:

* `A`: This parameter points to the directory of the Redis application.

* `LOG`: `LOG` represents the log level, where lower log levels mean more detailed output. Options include: `error`, `warn`, `info`, `debug`, `trace`.

* `NET`: This parameter enables qemu's virtio-net.

* `BLK`: This parameter enables qemu's virtio-blk.

* `ARCH`: `ARCH` indicates the architecture RuxOS is running on, with options including: `x86_64`, `aarch64`, `riscv64`.

* `SMP`: `SMP` enables RuxOS's multi-core feature, followed by the number of cores to be launched.

* `ARGS`: `ARGS` provides the necessary parameters for running redis-server. Here, it specifies running redis-server on 0.0.0.0:5555 in qemu, and not persisting data periodically.

By running the above command, the Redis server starts on port 5555.

## How to Connect and Test

It is recommended to use [Redis tools](https://redis.io/resources/tools/) to connect to the Redis server:

```shell
sudo apt install redis-tools
```

### redis-cli

Run:

```shell
redis-cli -p 5555
```

Then, you can execute all Redis client commands, similar to running on operating systems like Linux.

### redis-benchmark

Use the Redis benchmark tool for testing:

```shell
redis-benchmark -p 5555
```

For more detailed benchmark parameters, refer to [Redis Benchmark](https://redis.io/docs/management/optimization/benchmarks/).

## Use Musl libc

By default, RuxOS's redis-server uses its custom C application ruxlibc.

To leverage the integrated standard musl libc provided by RuxOS, add `MUSL=y` to the run command.

## Use 9pfs

By default, RuxOS passes parameters to the application through the `ARGS` parameter in the command line, which may not be ideal. Now RuxOS has successfully integrated 9pfs for sharing file directories between the host and qemu, enabling the application to pass parameters through its own configuration file.

Run the following command:

```shell
make A=apps/c/redis/ LOG=error NET=y V9P=y BLK=y V9P_PATH=apps/c/redis ARCH=aarch64 SMP=4 ARGS="./redis-server,/v9fs/redis.conf" run
```

Parameter explanation:

* `V9P`: Use `V9P=y` to enable qemu's virtio-9p backend.

* `V9P_PATH`: `V9P_PATH` points to the directory on the host for sharing, containing the Redis configuration file.
