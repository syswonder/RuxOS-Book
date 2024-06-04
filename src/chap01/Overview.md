
# RuxOS 概述

RuxOS，中文称：如意一体操作系统，是矽望社区研发并长期维护的一款 Unikernel 操作系统。

## 特性（基于 v0.0.1）

### 多架构支持

RuxOS 目前完成了在 X86_64、AArch64、Risc-V64 三种架构的 QEMU 环境中启动和运行应用，其中对 AArch64、X86_64 两种架构做了大量工作。

同时对树莓派4B裸机环境也进行了适配，能够在树莓派4B中运行 RuxOS，适配了SD卡驱动，能够进行数据持久化。

### 多核多线程支持

RuxOS 支持多核环境运行，支持多线程应用。RuxOS 采用先初始化主核，再由主核启动从核的策略，支持多核环境运行。同时，借助较为成熟的调度器，完成了多线程的支持，和多核调度的支持。

### 多种调度策略

RuxOS 支持三种调度策略：

- 先入先出调度（First In First Out），任务依次执行，直到运行结束或主动让出。

- 时间片轮转调度（Round Robin），任务基于分配的时间片运行，基于时钟中断进行切换。

- 完全公平调度（Complete Fair Schedueling），基于CFS算法，尽可能保证任务获取相等的CPU时间。

### VirtIO 驱动

RuxOS 支持多类 VirtIO 设备，实现了对应的前端接口。包括网络设备（virtio-net）、块设备（virtio-blk）、gpu设备（virtio-gpu）、9p设备（virtio-9p）。

### 基于 smoltcp 的网络协议栈

RuxOS 基于 Rust 第三方库 smoltcp 实现了 TCP/UDP 网络协议栈，适配 Ipv4 地址。

### 多类文件系统

RuxOS 适配了多类文件系统：

- fatfs。基于 Rust 第三方库 rust-fatfs 进行了封装，支持文件系统相关接口，并借助 VirtIO 块设备完成数据的持久化。

- ramfs。内存文件系统，数据保留在内存中，借助 ramfs 生成了匹配 Linux 的 procfs、etcfs 等。

- 9pfs。基于 VirtIO-9p 支持了 9pfs，使得 RuxOS 在 QEMU 环境中能够与 host 共享目录。

- devfs。初步实现了部分设备文件（random、null、zero）。

### 动态加载应用程序

RuxOS 支持动态加载应用的 ELF 文件，以及相关的动态链接库。

## 应用及编程语言支持

RuxOS 目前对如下应用完成了适配和验证：

- [Redis](../chap02/apps/redis.md)。在 RuxOS 上运行 Redis Server，并通过标准 redis-cli 和 redis-benchmark 进行测试和验证。

- [Nginx](../chap02/apps/nginx.md)。在 RuxOS 上运行 Nginx 作为网络服务器，运行指定网页。

- [Wamr](../chap02/apps/wamr.md)。在 RuxOS 上运行 wasm 字节码解释器 WAMR，并借助 wasi-nn 神经网络后端运行简单的 tensorflow 测试。

- [Iperf](../chap02/apps/iperf.md)。在 RuxOS 上运行标准 Iperf 测试。

- [Sqlite](../chap02/apps/sqlite.md)。在 RuxOS 上运行数据库应用 Sqlite。

- C/C++。基于 musl libc 完成对 C/C++ 程序的适配。

## 工具

为了方便应用部署，矽望社区团队开发了 [RuxGo](../chap04/ruxgo.md) 工具，用于简化应用运行的配置、命令参数等。

