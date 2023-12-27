# ruxlibc

Inspired by [relibc](https://github.com/redox-os/relibc) and [nolibc](https://github.com/unikraft/unikraft/tree/staging/lib/nolibc), `ruxlibc` is a C library implemented in Rust. Its main features and purposes include:

* **Lightweight and Concise**: `ruxlibc` only includes the most frequently used and common parts of the libc API. It processes these API parts to significantly reduce the size of the generated image files. Leveraging Rust's feature mechanism and considering the characteristics of unikernel operating systems, `ruxlibc` divides different API functionalities into multiple modules for conditional compilation. Applications can select the necessary modules based on their characteristics for building and running.

* **Memory Safety Based on Rust**: Inspired by `relibc`, `ruxlibc` also uses the Rust language for implementation to ensure memory safety as much as possible at the language level. Additionally, `ruxlibc` reasonably sets and handles error types generated during runtime, facilitating debugging for both kernel and application developers.

## Features

The implementation of `ruxlibc` is based on musl libc, and it utilizes Rust's feature mechanism for customization. The features included are as follows:

| Feature Name | Feature Description | 
| --- | --- |
| smp | Enable multi-core support. |
| fp_simd | Enable floating-point registers, supporting data types like `float`. |
| irq | Enable interrupts. |
| alloc | Enable dynamic memory allocation, including the use of dynamically allocated data structures. |
| tls | Enable thread-local storage. |
| multitask | Enable multitasking. |
| fs | Enable file system support. |
| net | Enable the network module, allowing the invocation of socket-related APIs. |
| signal | Enable signal module. |
| fd | Enable file descriptors, maintaining a file descriptor table in the kernel. |
| pipe | Enable APIs related to pipes. |
| select | Enable I/O multiplexing API. |
| epoll | Enable APIs related to epoll. |
| random-hw | Use hardware instructions to generate random numbers. |

## How to Use

Refer to the [Custom Applications](../../chap03/your_app.md) section for information on integrating your C application into RuxOS.
