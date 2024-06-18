
# 内核子模块

基于 RuxOS 组件，在功能模块层封装出了多个内核子模块。

### 内存分配模块 axalloc

内存分配模块移植于 ArceOS，封装了底层不同的内存分配算法，提供统一的全局内存分配器 `GlobalAllocator`，提供给 rust 用作动态内存分配的分配器。

提供如下 feature，默认使用 tlsf 分配器。

- tlsf：使用 tlsf 算法。

- slab：使用 slab 算法。

- buddy：使用 buddy 算法。


### 网络模块 axnet

网络模块移植于 ArceOS，借助了第三方库 [smoltcp](https://crates.io/crates/smoltcp) 提供的网络栈，对其进行封装，支持TCP、UDP 协议，支持 IpV4 协议，提供套接字编程接口。

RuxOS 正在进行 lwip 的移植工作。

### 任务调度模块 ruxtask

ruxtask 模块提供了任务管理的多种数据结构及方法。

- 提供单线程/多线程环境下，调度器初始化、yield、睡眠、新任务生成等编程接口。

- 提供就绪队列、等待队列，及相关的编程接口，包括了任务的切换、调度、阻塞、唤醒等。支持基于事件的阻塞和唤醒机制，用于 futex 等机制的实现；支持基于定时器的阻塞和唤醒机制，用于 sleep 等系统调用。

- 对内核任务的描述，提供 `TaskInner` 数据结构，描述内核任务的基本属性、状态信息。

重要 feature：

```txt
multitask = [
    "dep:ruxconfig", "dep:percpu", "dep:spinlock", "dep:lazy_init", "dep:memory_addr",
    "dep:scheduler", "dep:timer_list", "kernel_guard", "dep:crate_interface",
]

tls = ["ruxhal/tls"]
preempt = ["irq", "percpu?/preempt", "kernel_guard/preempt"]

sched_fifo = ["multitask"]
sched_rr = ["multitask", "preempt"]
sched_cfs = ["multitask", "preempt"]
```

- multitask：是否启用多线程。

- tls：线程局部存储，可定义线程局部数据。

- preempt：是否支持任务抢占。

- sched_：选取调度算法。


### 驱动模块 ruxdriver

在[底层组件](../crates/drivers.md)中对各类驱动的基本特征进行了定义，在该模块中，对各种类型的设备进行注册、初始化。

### 9pfs 模块 rux9p

9pfs 提供了主机与 qemu 共享目录的功能，方便了应用的开发，具体内容[参考这里](./9pfs.md)。


### 显示模块 ruxdisplay

提供了对 virtio-gpu 设备的初始化接口，在这里维护了 `MAIN_DISPLAY` 这一静态变量，封装了底层组件的显示相关接口。


### 文件系统模块 ruxfs

ruxfs 提供了文件系统初始化的重要接口，以及借助 [rust-fatfs](https://github.com/syswonder/rust-fatfs.git) 支持了 fatfs。

- 提供对 ramfs/blkfs 的初始化，根目录默认初始化为内存文件系统或基于 virtio 的块设备文件系统。

- 提供兼容 Linux 的相关文件系统的挂载，包括 devfs、procfs、tmpfs、sysfs、etcfs，并生成相关的诸多系统文件。

- 提供 File/Directory 的数据结构和相关方法，用于上层系统调用的实现。

ruxfs 支持动态挂载文件系统，并能根据路径执行指定文件系统的相关方法，目前仍在完善中。

