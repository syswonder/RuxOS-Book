# 编译参数说明

RuxOS 提供了看起繁杂但却灵活且明确的编译参数，来针对多种类型的应用进行构建和运行。

**通用参数** ：

| General Options | |
| --- | --- |
| ARCH | 目标架构： x86_64, riscv64, aarch64. 默认架构为 x86_64。 |
| PLATFORM | 在 `platforms` 目录下定义的目标平台。该参数可以由用户定义，也可以根据 `ARCH` 参数进行生成。里面包含了平台相关的参数定义。 |
| SMP | CPU 核数。如果该参数大于1，就会启用多核的特性。默认值为1。 |
| MODE | 与 `cargo build` 相关的模式，默认为 release。 |
| LOG | 日志等级: warn, error, info, debug, trace。默认是 warn。 |
| V | Verbose 等级: (empty), 1, 2 |
| ARGS | 命令行参数，使用逗号分隔，不允许空格，可以为空。用来给应用程序传递具体的参数，即 `argc`，`argv`。 |
| ENVS | 环境变量参数，使用逗号分隔，不允许空格，可以为空。 |

**应用参数** ：

| App Options | |
| --- | --- |
| A/APP | 应用程序目录的路径。支持相对路径和绝对路径。默认指向 `apps/c/helloworld.`。 |
| FEATURES | RuxOS 模块的 feature。该参数用于在命令行开启用户想要的额外 feature，而不需要出现在具体应用的 `features.txt`文件中。 |
| APP_FEATURES | rust 应用的额外 feature。 |

**Qemu 参数**：

| Qemu Options | |
|---|---|
| BLK | 使能 qemu virtio-blk 后端。如果应用需要对数据进行持久化，或者通过文件系统传递配置文件，则需要设置该参数。 |
| NET | 使能 qemu 的 virtio-net 后端。如果应用需要使用网络，则应该设置该参数。 |
| GRAPHIC | 使能 qemu 的 virtio-gpu 后端，用于图形界面输出。 |
| BUS | 选择设备总线类型：mmio, pci。 |
| DISK_IMG | 文件系统磁盘镜像的路径。默认值是根目录的 `disk.img`。 |
| ACCEL | 使能 x86 的 KVM 硬件加速。 |
| QEMU_LOG | 使能 qemu 的日志，默认输出到 `qemu.log` 文件中，里面包含运行的汇编代码。 |
| NET_DUMP | 网络包抓取，输出到根目录的 `netdump.pcap` 文件中。 |
| NET_DEV | qemu 网络设备类型：user, tap。 |

**9P 参数**：

| 9P Options | |
|---|---|
| V9P_PATH | host 上用于共享的文件目录。默认值是根目录。 |
| NET_9P_ADDR| 9p netdev 的地址和端口。默认值是 `127.0.0.1:564`。 |
| ANAME_9P | 9pfs 的路径。 |
| PROTOCOL_9P | 9p 协议类型。 |

**网络参数**，默认端口号为 5555：

| Network Options | |
|---|---|
| IP | Ruxos IPv4 地址（qemu user netdev，默认是 10.0.2.15）。 |
| GW | 网关 IPv4 地址（qemu user netdev，默认是 10.0.2.2）。 |

**Libc 参数**：

| Libc Options | |
|---|---|
| MUSL | 使用 musl libc 来进行编译、链接。默认情况下 RuxOS 用的是 `ruxlibc` 。用户可以通过设置 `MUSL=y` 来使能 musl libc。 |



