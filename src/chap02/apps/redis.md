
# Redis

RuxOS 支持在 Qemu 上运行 [Redis](https://github.com/redis/redis) 服务器端。

## 创建文件系统镜像

在 RuxOS 根目录运行：

```shell
make disk_img
```

该命令会在根目录生成一个文件系统(fatfs)镜像 `disk.img`，传给 qemu 使用。

## 运行 Redis-Server

运行下面的命令，会在 5555 端口上启动 Redis 服务器端。

```shell
make A=apps/c/redis/ LOG=error NET=y BLK=y ARCH=aarch64 SMP=4 ARGS="./redis-server,--bind,0.0.0.0,--port,5555,--save,\"\",--appendonly,no,--protected-mode,no,--ignore-warnings,ARM64-COW-BUG" run
```

参数解释：

* `A`: 该参数指向 Redis 应用所在的目录。

* `LOG`: `LOG` 表示输出的日志等级，更低的日志等级意味着更详细的输出。可选包含：`error`,  `warn`, `info`, `debug`, `trace`。

* `NET`: 该参数用于使能 qemu 的 virtio-net。

* `BLK`: 该参数用于使能 qemu 的 virtio-blk。

* `ARCH`: `ARCH` 表示将 RuxOS 运行在何种架构上，可选架构参数包括: `x86_64`, `aarch64`, `riscv64`.

* `SMP`: `SMP` 用于使能 RuxOS 的多核 feature，紧跟着的数字表示启动的核数。

* `ARGS`: `ARGS` 提供 redis-server 运行所需要的参数。这里表示将 redis-server 运行在 qemu 的 0.0.0.0:5555，且不对数据做周期性的持久化。

通过运行上述命令，Redis 的服务器端在端口 5555 上启动。

## 如何连接、测试

推荐使用 [redis tools](https://redis.io/resources/tools/) 来连接到 Redis 服务器:

```shell
sudo apt install redis-tools
```

### redis-cli

运行：

```shell
redis-cli -p 5555
```

之后就可以执行所有 redis 的客户端命令，与在 linux 等操作系统上运行无异。

### redis-benchmark

Use the Redis benchmark testing tool to test:
```shell
redis-benchmark -p 5555
```
More parameters can be found on [Redis Benchmark](https://redis.io/docs/management/optimization/benchmarks/).

## Use Musl libc

By default, RuxOS Redis Server is supported by ruxlibc, which is a customized standard C library. 

By adding `MUSL=y` to the make command, redis server will be compiled, linked by standard Musl libc.

## Use 9pfs

By default, RuxOS passes application arguments by `ARGS`, which can be inconvenient. RuxOS successfully integrate 9p protocol, and provide 9pfs to share directories and files between host and qemu. 

Run following command:
```shell
make A=apps/c/redis/ LOG=error NET=y V9P=y BLK=y V9P_PATH=apps/c/redis ARCH=aarch64 SMP=4 ARGS="./redis-server,/v9fs/redis.conf" run
```
Parameter explanation:
* `V9P`: Use `V9P=y` to enable virtio-9p on qemu.
* `V9P_PATH`: `V9P_PATH` points to the shared directory, which contains the redis configuration file.

