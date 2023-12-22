
# ruxos-posix-api

`ruxos-posix-api` 层提供了与 [POSIX](https://en.wikipedia.org/wiki/POSIX) 标准一致的一批 API，用于支持 [ruxlibc](./ruxlibc.md) 和 [ruxmusl](./ruxmusl.md)。`ruxos-posix-api` 有以下特征：

* API 的设计和实现基于标准的 POSIX 标准。

* API 使用 Rust 进行实现，同时提供具有相同名称的 Rust 和 C 的 API。

* 关注到 unikernel 操作系统的特点，部分 POSIX API 进行了特殊处理和实现。

* `ruxos-posix-api` 提供多模块的 Rust feature 来减小内核镜像大小。

下面将对 `ruxos-posix-api` 的目的和与标准 POSIX API 的区别进行介绍和说明。

## 目的

为了提供对用户库的支持，以及支持标准的 C 库，POSIX 定义了在不同系统上兼容的一批 API 的标准。

`ruxos-posix-api` 基于 POSIX 规范对部分 POSIX 系统调用 API 进行了实现。系统调用号、参数类型、参数数量严格遵循 POSIX 系统调用标准，用来支持上层的 `ruxlibc` 和 `ruxmusl`。将用户库与系统调用层解耦，方便了系统开发人员定位错误和解决错误，具有更清晰的层次结构。

## 区别

`ruxos-posix-api` 与标准的 POSIX 系统调用 API 有以下的不同：

* [系统调用名](#系统调用名)

* [更细分的系统调用](#更细分的系统调用)

* [架构无关](#架构无关)

### 系统调用名

系统调用以 *sys_* 开头，参考 [RuxOS 系统调用列表](#ruxos-系统调用列表)，紧跟着是具体的函数名。

### 更细分的系统调用

由于在 [ruxlibc](./ruxlibc.md) 中对部分系统调用进行了特殊的对待和使用，而有的并不是在标准的 POSIX 库中，这部分 API 在 [RuxOS 系统调用列表](#ruxos-系统调用列表) 用斜体指出，例如 `sys_pthread_create`。

通过加入更细化的系统调用，以及对一些特殊的库，例如 pthread 库，进行特殊处理，这一设计的目的在于缩短系统调用路径，以及省去某些 flag 参数解析时间。

由于在 unikernel 操作系统中，用户的应用程序和内核运行在同一特权级。因此，使用直接的函数调用，而非系统调用能够提高应用程序的性能，也减少了编程者和内核开发者的调试时间。

一些特殊处理的 API 在[下面](#特殊api)进行了解释和介绍。

### 架构无关

在标准的 POSXI 规范中，不同架构有不同的系统调用类型、名称，但在 `ruxos-posix-api` 中，我们不对架构进行区分，例如 AARCH64 上也同时存在 `dup/dup2/dup3` 三种 API。

## 特殊API

由 RuxOS 自定义的 API 在[RuxOS 系统调用列表](#ruxos-系统调用列表)用斜体标出。

下面对部分 API 进行说明和解释。

### sys_clone VS sys_pthread_create

在 libc 中，`sys_clone` 用于创建线程或进程。内核通过解析传入的标志来决定是否创建线程或进程，并设置新线程或新进程的共享属性。

在 unikernel 操作系统 RuxOS 中只支持一个进程，不支持 `fork` 功能。因此，RuxOS 的 `sys_clone` 语义只需要满足新线程的创建，新线程总是与父线程共享地址空间、文件描述符表、信号等资源。

通过简化语义，RuxOS 可以更快地完成线程创建，并保持与 Linux 基本一致的线程创建语义。 在 [ruxlibc](./ruxlibc.md) 中，系统调用变成了函数调用，因此 RuxOS 不需要支持通过 `sys_clone` 创建新线程，而是直接支持 `pthread_create` 的实现，只是将新任务扔到调度队列中。

### sys_futex VS sys_mutex_xxx

在 Linux 内核中，futex 用于支持互斥锁等，通过监听某个地址的值来实现。

由于 RuxOS 内核提供了各种锁的实现，在支持 ruxlibc 时，RuxOS 实现了以 pthread_mutex 开头的互斥锁 API，可以直接调用内核中实现的互斥锁相关函数，并且兼容 musl libc 中的锁定义。

当支持 musl libc 时，RuxOS 实现了 futex 语义的简化版本。当线程监听的地址值不变时，会调用 `yield` 函数主动让出 CPU。

### sys_mmap

mmap 将一段虚拟地址映射给用户程序，并通过处理缺页异常为用户程序分配特定的物理地址。

在 RuxOS 中，由于用户程序只有一个进程，并且拥有整个物理地址空间，所以现在的 mmap 直接为用户程序分配给定大小的地址空间，并在 munmap 中释放。同时，RuxOS不支持文件映射，因此不处理 fd。

### sys_pthread_key_xxx

`pthread_key` 相关的 API 提供线程局部键值对存储。这部分的实现本应该属于 libc 。

但为了更简单直接地支持这些 API，RuxOS 将相应的键值放入 `task_inner` 结构中，简化了 ruxlibc 的实现。

在 musl libc 中，这部分被放置到 musl libc 管理的 tls 中，因此 RuxOS 不需要提供相应的系统调用。

### sys_freeaddrinfo, sys_getaddrinfo

libc 中的这两个 API 解析网络地址以及释放相应的数据结构。它的实现属于 libc 层，由于需要读取本地的 `/etc/hosts` 文件来发送 DNS 查询，RuxOS 对其进行了特殊处理以简化实现。

## RuxOS 系统调用列表

| Module Name | Syscall Name | Description |
| --- | --- | --- |
| **io_mpx** | sys_epoll_create | Create an epoll fd |
| | sys_epoll_ctl | Control interface for an epoll file descriptor |
| | sys_epoll_pwait, sys_epoll_wait | Wait for an I/O event on an epoll file descriptor |
| | sys_poll, sys_ppoll | Wait for some event on a file descriptor |
| | sys_pselect6, sys_select | Monitor multiple file descriptors |
| **io** | sys_read, sys_write | Read/Write from a fd |
| | sys_readv, sys_writev | Read/Write data from/into multiple buffers |
| **resources** | sys_getrlimit, sys_prlimit64, sys_setrlimit | Get/Set resource limits |
| **rt_sig** | sys_rt_sigaction | Examine and change a signal action |
| | sys_rt_sigprocmask | Examine and change blocked signals |
| **stat** | sys_umask | Set file mode creation mask |
| **sys** | sys_sysinfo | Return system information |
| **task** | sys_exit | |
| | sys_getpid | |
| | sys_sched_yield | |
| **time** | sys_clock_gettime, sys_clock_settime | |
| | sys_nanosleep | |
| **fd_ops** | sys_close | |
| | sys_dup, sys_dup2, sys_dup3 | |
| | sys_fcntl | |
| **fs** | sys_fdatasync, sys_fsync | |
| | sys_fstat, sys_lstat, sys_newfstatat, sys_stat | |
| | sys_getcwd | |
| | sys_open, sys_openat | |
| | sys_mkdir, sys_mkdirat | |
| | sys_rename, sys_renameat | |
| | sys_unlink, sys_unlinkat | |
| | sys_lseek | |
| | sys_rmdir | |
| **ioctl** | sys_ioctl | |
| **mmap** | sys_mmap, sys_munmap | |
| | sys_mprotect | |
| **net** | sys_accept, sys_bind, sys_connect, sys_listen | |
| | sys_socket | |
| | sys_shutdown | |
| | *sys_freeaddrinfo, sys_getaddrinfo* | |
| | sys_recv, sys_recvfrom | |
| | sys_send, sys_sendmsg, sys_sendto | |
| | sys_getsockname | |
| | sys_setsockopt | |
| | sys_getpeername | |
| **pipe** | sys_pipe, sys_pipe2 | |
| **signal** | sys_getitimer, sys_setitimer | |
| | sys_sigaction | |
| **pthread** | *sys_pthread_getspecific/setspecific* | |
| | *sys_pthread_key_create/delete* | |
| | *sys_pthread_create, sys_pthread_exit* | |
| | *sys_pthread_join* | |
| | *sys_pthread_self* | |
| | sys_clone | |
| | sys_set_tid_address | |
| **pthread::futex** | sys_futex | |
| **pthread::condvar** | *sys_pthread_cond_timedwait, sys_pthread_cond_wait* | |
| | *sys_pthread_cond_init/destroy* | |
| | *sys_pthread_cond_signal/broadcast* | |
| **pthread::mutex** | *sys_pthread_mutex_destroy/init* | |
| | *sys_pthread_mutex_lock/trylock/unlock* | |



