
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

使用 Redis benchmark 基准测试工具来进行测试:

```shell
redis-benchmark -p 5555
```

更多详细的测试参数可以参考 [Redis Benchmark](https://redis.io/docs/management/optimization/benchmarks/).

## 使用 Musl libc

默认情况下，RuxOS 的 redis-server 使用自定义的 C 应用程序 ruxlibc。

通过添加 `MUSL=y` 到运行的命令中，就能借助 RuxOS 集成好的标准 musl libc来编译、链接。

## 使用 9pfs

默认情况下，RuxOS 通过命令行中的 `ARGS` 参数来向应用传递参数，这种方法可能会带来不变。现在 RuxOS 已经成功集成了 9pfs，用于 host 和 qemu 进行文件目录的共享，即可以通过应用自己的配置文件来传递参数。

运行下面的命令:

```shell
make A=apps/c/redis/ LOG=error NET=y V9P=y BLK=y V9P_PATH=apps/c/redis ARCH=aarch64 SMP=4 ARGS="./redis-server,/v9fs/redis.conf" run
```

参数解释:

* `V9P`: 使用 `V9P=y` 来使能 qemu 的 virtio-9p 后端。

* `V9P_PATH`: `V9P_PATH` 指向 host 上的用于共享的目录，里面包含了 Redis 的配置文件。

