# 编译参数及常用命令说明

RuxOS 提供了灵活、明确的诸多编译参数，来针对多种类型的应用进行构建和运行，同时进行应用裁剪和 QEMU 配置。同时为开发、调试、运行提供了较多命令。下面对这些参数和常用命令进行介绍，对常用且往往需要用户指定的参数进行了加粗显示。

## 通用参数

| General Options | |
| --- | --- |
| **ARCH** | 目标架构： x86_64, riscv64, aarch64. 默认架构为 x86_64。 |
| PLATFORM | 在 `platforms` 目录下定义的目标平台。该参数可以由用户定义，也可以根据 `ARCH` 参数进行生成。里面包含了平台相关的参数定义。 |
| **SMP** | CPU 核数。如果该参数大于1，就会启用多核的特性。默认值为1。 |
| MODE | 与 `cargo build` 相关的模式，默认为 release。 |
| **LOG** | 日志等级: warn, error, info, debug, trace。默认是 warn。 |
| V | Verbose 等级: (empty), 1, 2 |
| ARGS | 命令行参数，使用逗号分隔，不允许空格，可以为空。用来给应用程序传递具体的参数，即 `argc`，`argv`。 |
| ENVS | 环境变量参数，使用逗号分隔，不允许空格，可以为空。 |

## 应用参数

| App Options | |
| --- | --- |
| **A/APP** | 应用程序目录的路径。支持相对路径和绝对路径。默认指向 `apps/c/helloworld.`。 |
| **FEATURES** | RuxOS 模块的 feature。该参数用于在命令行开启用户想要的额外 feature，而不需要出现在具体应用的 `features.txt`文件中。 |
| APP_FEATURES | rust 应用的额外 feature。 |

## Qemu 参数

| Qemu Options | |
|---|---|
| **BLK** | 使能 qemu virtio-blk 后端。如果应用需要对数据进行持久化，或者通过文件系统传递配置文件，则需要设置该参数。 |
| **NET** | 使能 qemu 的 virtio-net 后端。如果应用需要使用网络，则应该设置该参数。 |
| GRAPHIC | 使能 qemu 的 virtio-gpu 后端，用于图形界面输出。 |
| BUS | 选择设备总线类型：mmio, pci。 |
| DISK_IMG | 文件系统磁盘镜像的路径。默认值是根目录的 `disk.img`。 |
| ACCEL | 使能 x86 的 KVM 硬件加速。 |
| QEMU_LOG | 使能 qemu 的日志，默认输出到 `qemu.log` 文件中，里面包含运行的汇编代码。 |
| NET_DUMP | 网络包抓取，输出到根目录的 `netdump.pcap` 文件中。 |
| NET_DEV | qemu 网络设备类型：user, tap。 |
| START_PORT | qemu 开放的端口的起始端口号（默认是5555号端口）。 |
| PORTS_NUM | qemu 开放的端口的数量（默认是5个）。 |

## 9P 参数

| 9P Options | |
|---|---|
| **V9P_PATH** | host 上用于共享的文件目录。默认值是根目录。 |
| NET_9P_ADDR| 9p netdev 的地址和端口。默认值是 `127.0.0.1:564`。 |
| ANAME_9P | 9pfs 的路径。 |
| PROTOCOL_9P | 9p 协议类型。 |

## 网络参数（默认端口号 5555）

| Network Options | |
|---|---|
| IP | Ruxos IPv4 地址（qemu user netdev，默认是 10.0.2.15）。 |
| GW | 网关 IPv4 地址（qemu user netdev，默认是 10.0.2.2）。 |

## Libc 参数

| Libc Options | |
|---|---|
| **MUSL** | 使用 musl libc 来进行编译、链接。默认情况下 RuxOS 用的是 `ruxlibc` 。用户可以通过设置 `MUSL=y` 来使能 musl libc。 |

# 运行命令

RuxOS 提供了多种运行命令，以满足不同的需求，包含编译、运行、调试等。这些命令需要在 RuxOS 根目录下运行。

## make build

编译指定的应用，默认为 `helloworld` 应用，生成可供 qemu 直接运行的二进制内核文件。

## make run

运行指定的应用，包含了 `make build` 的过程，将生成的二进制内核文件传给 qemu，qemu 的参数根据用户声明的[编译参数](#编译参数说明)进行生成。

## make disasm

将运行的二进制指令反汇编，生成文件包含了运行过程中的所有汇编指令。

## make debug

启动 GDB 进行调试。

## make disk_img

借助 `dd`，`mkfs` 命令生成一个 fat32 镜像文件，传给 qemu 作为磁盘文件。

当涉及到需要使用文件系统、块设备存储的程序时，需要提供给 qemu 一个块设备。

## make clean_c

清除 `ruxlibc` 的 `libc.a` 以及 C 应用程序声明的 `app-objs`，如果对应的应用程序的 `axbuild.mk` 也写了 `clean_c` 
也会相应的运行。

## make clean_musl

清除 musl libc 生成的 install 目录和 build 目录，该命令之后，运行 musl libc 相关的应用时会重新编译 musl libc。

## make clean

该命令包含 `make clean_c`，`make clean_musl`，同时会清除应用程序的 elf 文件和 bin 文件，并执行 `cargo clean`。

## make clippy

借助 clippy 做代码规范检查。

## make fmt

借助 `cargo fmt` 对调整 Rust 代码格式。

## make fmt_c

对 C 代码格式进行规范。

## make test

对 `apps/` 目录下的应用进行测试，并通过比对输出结果与相应的 `.out` 文件来判断是否正确。


