# ruxos-posix-api

The `ruxos-posix-api` layer provides a set of APIs consistent with the [POSIX](https://en.wikipedia.org/wiki/POSIX) standard, supporting both [ruxlibc](./ruxlibc.md) and [ruxmusl](./ruxmusl.md). `ruxos-posix-api` has the following characteristics:

- The design and implementation of APIs are based on the POSIX standard.
- APIs are implemented in Rust and provide both Rust and C APIs with the same names.
- It takes into account the characteristics of unikernel operating systems, providing special handling and implementation for some POSIX APIs.
- `ruxos-posix-api` provides multiple modular Rust features to reduce the size of the kernel image.

The following will introduce and explain the purpose of `ruxos-posix-api` and the differences from the standard POSIX APIs.

## Purpose

To support user libraries and the standard C library, POSIX defines a set of APIs compatible with different systems.

`ruxos-posix-api` implements part of the POSIX system call APIs based on the POSIX specification. The system call numbers, parameter types, and the number of parameters strictly follow the POSIX system call standard, supporting the upper layers of `ruxlibc` and `ruxmusl`. Decoupling the user library from the system call layer facilitates system developers in locating and resolving errors, resulting in a clearer hierarchical structure.

## Differences

`ruxos-posix-api` differs from standard POSIX system call APIs in the following aspects:

- [System Call Names](#system-call-names)
- [More Fine-grained System Calls](#more-fine-grained-system-calls)
- [Architecture Independence](#architecture-independence)

### System Call Names

System calls start with *sys_*, referring to the [RuxOS System Call List](#ruxos-system-call-list), followed by the specific function name.

### More Fine-grained System Calls

Due to the special treatment and usage of some system calls in [ruxlibc](./ruxlibc.md), and some of them are not in the standard POSIX library, these APIs are indicated in [RuxOS System Call List](#ruxos-system-call-list) in italics, for example, `sys_pthread_create`.

By introducing more fine-grained system calls and special handling of some libraries, such as the pthread library, the design aims to shorten the system call path and eliminate the parsing time for certain flag parameters.

In unikernel operating systems, user applications and the kernel run at the same privilege level. Therefore, using direct function calls instead of system calls can improve application performance and reduce debugging time for programmers and kernel developers.

Some specially handled APIs are explained and introduced [below](#special-apis).

### Architecture Independence

In the standard POSIX specification, different architectures have different types and names for system calls. However, in `ruxos-posix-api`, there is no differentiation based on architecture. For example, on AARCH64, all three APIs `dup/dup2/dup3` coexist.

## Special APIs

Custom APIs defined by RuxOS are marked in [RuxOS System Call List](#ruxos-system-call-list) in italics.

The following provides explanations and details for some APIs.

### sys_clone VS sys_pthread_create

In libc, `sys_clone` is used to create threads or processes. The kernel decides whether to create a thread or process by parsing the incoming flags and sets the shared attributes for the new thread or process.

In the unikernel operating system RuxOS, only one process is supported, and the `fork` feature is not supported. Therefore, the semantics of `sys_clone` in RuxOS only need to meet the creation of a new thread. The new thread always shares the address space, file descriptor table, signals, and other resources with the parent thread.

By simplifying the semantics, RuxOS can create threads faster and maintain thread creation semantics that are essentially consistent with Linux. In [ruxlibc](./ruxlibc.md), system calls become function calls. Therefore, RuxOS does not need to support creating new threads through `sys_clone` but directly supports the implementation of `pthread_create`. The new task is simply placed in the scheduling queue.

### sys_futex VS sys_mutex_xxx

In the Linux kernel, futex is used to support mutexes, among other things, by listening to the value at a certain address.

Since RuxOS provides implementations for various locks and supports ruxlibc, RuxOS has implemented mutex APIs starting with `pthread_mutex`. These can directly call the mutex-related functions implemented in the kernel and are compatible with the mutex definitions in musl libc.

When supporting musl libc, RuxOS implements a simplified version of futex semantics. When the value at the address monitored by a thread does not change, the `yield` function is called to voluntarily yield the CPU.

### sys_mmap

`mmap` maps a virtual address range to a user program and allocates specific physical addresses to the user program by handling page faults.

In RuxOS, since there is only one process for user programs and it has the entire physical address space, the current implementation of `mmap` directly allocates a given size of address space to the user program and releases it in `munmap`. Also, RuxOS does not support file mapping, so it does not handle file descriptors.

### sys_pthread_key_xxx

APIs related to `pthread_key` provide thread-local key-value storage. This part should have belonged to the libc layer.

However, to support these APIs more simply and directly, RuxOS places the corresponding keys in the `task_inner` structure, simplifying the implementation of ruxlibc.

In musl libc, this part is placed in the tls managed by musl libc. Therefore, RuxOS does not need to provide corresponding system calls.

### sys_freeaddrinfo, sys_getaddrinfo

These two APIs in libc parse network addresses and release corresponding data structures. Their implementation belongs to the libc layer. Due to the need to read the local `/etc/hosts` file to send DNS queries, RuxOS has special handling to simplify the implementation. 

## RuxOS System Call List

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
| **sys** | sys_sysinfo | Return system information
