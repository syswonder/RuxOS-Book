
# ruxlibc

`ruxlibc` 受到 [relibc](https://github.com/redox-os/relibc) 和 [nolibc](https://github.com/unikraft/unikraft/tree/staging/lib/nolibc) 的启发，是一个使用 Rust 实现的 C 用户库。他的主要特点和目的在于：

* **轻量，简洁**。`ruxlibc` 只包含了在 libc 中使用最频繁、最常见的部分 API，并针对这些 API 做了部分处理，大大减小了生成的映像文件的的大小。`ruxlibc` 借助了 Rust 的 feature 机制，同时关注到 unikernel 操作系统的特点，将不同的 API 根据功能划分为了多个模块，实现条件编译。应用程序根据自身的特点选取必须的模块来进行构建和运行。

* **基于 Rust 保障内存安全**。受到 `relibc` 的启发，`ruxlibc` 同样使用 Rust 语言来进行实现，从语言级别尽可能地保障内存安全。同时，在 `ruxlibc` 中对运行过程中产生的错误类型进行了合理的设置和处理，方便了内核开发者和应用开发者的调试工作。

## Features

`ruxlibc` 的实现基于 musl libc，使用 Rust 的 feature 机制来实现裁剪，其中包含的所有 feature 如下所示：

| Feature Name | Feature Description | 
| --- | --- |
| smp | 使能多核。 |
| fp_simd | 使能浮点数寄存器，支持 float 等数据类型。 |
| irq | 使能中断。 |
| alloc | 使能动态内存分配，包括使用动态分配的数据结构等。 |
| tls | 使能 thread-local storage。 |
| multitask | 使能多任务。 |
| fs | 使能文件系统。 |
| net | 使能网络模块，能够调用 socket 相关的 API。 |
| signal | 使能信号模块。 |
| fd | 使能文件描述符，内核中维护文件描述符表。 |
| pipe | 使能 pipe 相关的 API。 |
| select | 使能 I/O 多路复用 API。 |
| epoll | 使能 epoll 相关的 API。 |
| random-hw | 使用硬件指令生成随机数。 |

## 如何使用

参考 [自定义应用](../../chap03/your_app.md) 中介绍的如何将您的 C 应用集成到 RuxOS。

