
# 9pfs

本章节中，主要对 9p 协议进行了简要的介绍，以及如何在 RuxOS 上使用 9pfs 进行了简要的说明。

9PFS 即 9p-filesystem，是一种基于 9P 协议实现对 server 端文件系统读写的文件系统。

在 RuxOS 中，9pfs 对应于两个不同的特性（feature），即 `virtio-9p` 和 `net-9p`。其中 `virtio-9p` 是基于 hypervisor 中的 `virtio-9p` 虚拟设备进行通信来控制 host 文件系统的读写，而 `net-9p` 则通过网络 TCP 协议实现连接通信并控制 server 端文件系统的读写。这两个不同特性可以同时启用并正常工作。

9P 事实上是一种用来进行文件读写的通信协议，它只是在会话层的。这就意味着在本质上9P与物理层、数据链路层等无关。9P通信协议的版本存在 `9P2000`、`9P2000.L` 和 `9P2000.u` 三种，其协议内容可以参考以下链接：

* [9P2000的基本协议内容](https://ericvh.github.io/9p-rfc/rfc9p2000.html)

* [9P2000.L拓展协议版本](https://github.com/chaos/diod/blob/master/protocol.md)

* [9P2000.u拓展协议版本](http://ericvh.github.io/9p-rfc/rfc9p2000.u.html)

## virtio-9p

使用 `virtio-9p`需要在 APP 添加该 feature。

对于 C APP，是在 APP 目录下的 features.txt 下加入一行：

```txt
virtio-9p
```

对于 rust APP，则需要在 APP 目录下的 Cargo.toml 的 axstd 特性中加入 `virtio-9p` 特性，具体如下（该例子是 `application/fs/shell` 中的Cargo.toml）:

```txt
axstd = { path = "../../../ulib/axstd", features = ["alloc", "fs", "virtio-9p"], optional = true }
```

然后，为了使得 host（当前是 qemu-system-aarch64）启用 virtio-9p 的后端，需要在 `make` 命令行中加入参数 `V9P=y`。

例如:

```shell
make A=xxxx LOG=error V9P=y V9P_PATH=xxxx ARCH=xxxx
```

`V9P_PATH` 是一个**环境变量**，对应于 host 的文件目录映射路径，如果不设置该参数则为为当前目录 `./`。

完成以上步骤在理论上即可在根目录下创建一个 `v9fs` 的目录（或者作为根文件系统加载），该目录应当包含host后端所映射的文件目录。举例来说，当`V9P_PATH=./temp/`时，v9fs（或根文件）目录将和 `./temp` 目录保持一致。

此外，virtio-9p 涉及到了一些可设置的环境变量。这些环境变量都存在一个默认值，有时并不需要显示的设置，这些环境变量及其默认值分别为：

```makefile
V9P_PATH ?= ./           # 对应于host的文件目录映射路径，默认为当前目录
ANAME_9P ?= ./           # 对应与tattach时的aname路径参数，在当前版本下的qemu可以设置为任意值，但某些情况（host存在多个映射路径）下可能需要设置为选择的对应host文件目录路径
PROTOCOL_9P ?= 9P2000.L  # 默认选择的9P协议，如`9P2000.L`和`9P2000.u`，区分大小写
```

## net-9p

使用 `net-9p` 需要在 APP 添加该 feature。

对于 C APP，是在APP目录下的 features.txt 下加入一行：

```txt
net-9p
```

对于 rust APP，则需要在 APP 目录下的 Cargo.toml 的 axstd 特性中加入 `net-9p` 特性，具体如下（该例子是 `application/fs/shell`中的 Cargo.toml）:

```txt
axstd = { path = "../../../ulib/axstd", features = ["alloc", "fs", "net-9p"], optional = true }
```

然后，`net-9p` 需要通过 TCP 网络协议实现通信，因此需要在 `make` 命令行中加入参数 `NET=y`。

例如:

```shell
make A=xxxx LOG=error NET=y ARCH=xxxx
```

完成以上步骤在理论上即可在根目录下创建一个 `v9fs` 的目录（或者作为根文件系统加载），该目录应当包含host后端所映射的文件目录。`net-9p` 后端映射的具体路径可能需要通过 `ANAME_9P` 进行控制，但这具体取决于 server 端的设计（亦可能是在启动server时传入参数或更改部分server端代码）。

此外，`net-9p` 涉及到了一些可设置的环境变量。这些环境变量都存在一个默认值，有时并不需要显示的设置，这些环境变量及其默认值分别为：

```makefile
NET_9P_ADDR ?= 127.0.0.1:564 # 9P sever端的IP地址和PORT端口号，默认值为 127.0.0.1:564。
ANAME_9P ?= ./           # 对应与tattach时的aname路径参数，能需要设置为具体选择的对应host文件目录路径
PROTOCOL_9P ?= 9P2000.L  # 默认选择的9P协议，如`9P2000.L`和`9P2000.u`，区分大小写
```
