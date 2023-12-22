
# ruxmusl

本章节主要介绍了将 [musl libc](https://www.musl-libc.org/) 集成到 RuxOS 的过程。RuxOS 使用了一层兼容层来适配 musl libc，最终通过了 [libc-bench](https://git.musl-libc.org/cgit/libc-bench/) 的测试。


## 从 musl libc 到系统调用层

### 引入 musl libc 的重要性

`musl libc` 提供了 C 应用程序所必须的诸多 API，并且对内核的系统调用进行了封装。但是，并不是所有的函数都需要用到系统调用，有一大批的例如字符串处理等函数，不需要系统调用。这一批函数在 `musl libc` 中提供了相对完整、高效，且久经考验的实现。

因此，将 `musl libc` 集成到 RuxOS 之后，包含字符串处理在内的众多函数，内核将不再做额外的实现。在与 musl libc 并列的 [ruxlibc](./ruxlibc.md) 中，需要对这些函数进行一一实现，引入了较为繁琐的工作量，且容易出现错误。

### 系统调用及系统调用号

系统调用是由内核定义的一批可移植 API，根据不同的体系结构，系统调用对应的系统调用号可能不同。在 AARCH64 中，可以通过 `path/to/musl-libc/arch/aarch64/bits/syscall.h.in` 文件来查看。

对比不同架构上的系统调用，我们能够发现不只是系统调用号不一致，系统调用的类型也存在差别。例如，AARCH64 提供了 `dup` 和 `dup3` 两个系统调用，而没有提供 `dup2`，其中 `dup2` 是借助 `dup` + `fcntl` 来进行实现的。而 x86_64 则提供了上述三种系统调用。

### 触发同步异常

如何从 libc 函数进入到内核的系统调用层？以 `read()` 函数为例：

* `read()` 是由 C 标准库提供的读函数，实现在 `path/to/musl-libc/src/unistd/read.c`。在该函数中，调用 `syscall_cp(SYS_read, fd, buf, count)`，里面存在一个宏，定义在 `path/to/musl/arch/aarch64/syscall_arch.h` 中，通过 `svc 0` 来完成系统调用。并且将相关参数存到 `x0~x5`，将系统调用号存到了 `x8`，也就是说系统调用最多支持6个参数。

* `svc 0` 会触发一个同步异常，该同步异常迫使内核跳转到异常向量表中，查找并跳转到由内核定义的同步异常处理函数。

## 系统调用处理（A64）

### 解析参数

同步异常会进入到 `modules/ruxhal/src/arch/aarch64/trap.rs` 中定义的 `handle_sync_exception()` 函数，在这里通过解析 `ESR` 寄存器来获取异常状态信息，即发生异常的原因。然后通过读取 `x0~x5` 和 `x8` 来获取系统调用的参数和系统调用号，并进入到系统调用处理函数。

当开启 `musl` 这个 feature 时，在 `modules/ruxhal/src/trap.rs` 中的 `TrapHandler` trait 会增加 `handle_syscall()` 这个方法，具体实现在 `ulib/ruxmusl/src/trap.rs`。在这里会解析系统调用号，并分发到具体的处理函数。

### 系统调用分发

分发过程在 `ulib/ruxmusl/src/syscall/mod.rs` 中，系统调用号与标准的 A64 系统调用号一致，定义在 `ulib/ruxmusl/src/syscall/syscall_id.rs` 中，但目前存在部分系统调用缺失，后续会进行补全。分发过程即是匹配系统调用号的过程，并根据系统调用号将传入的参数解析为不同的类型，然后调用在 [`ruxos-posix-api`](./ruxos-posix-api.md) 中实现的具体的系统调用。

## 使用 ruxmusl

RuxOS 已经通过 makefile 给用户提供了简便的使用 musl libc 的方法，在编译、运行 C 程序的时候，只需要加上 `MUSL=y` 即可。

在使用 musl libc 的时候，有部分 feature 是需要强制定义的，RuxOS 已将其集成到了 makefile 中，无需额外工作：

* **fp_simd**: 由于 musl libc 需要编译所有的 C 标准库函数，包含了 `double` 等浮点数类型，因此需要开启该 feature。

* **fd**: 由于 musl libc 需要初始化 stdin/stdout/stderr，因此需要默认开启该 feature。

* **tls**: musl libc 自己对 tls 进行了管理，在创建新线程的时候，通过 `mmap` 预留了一部分用于存储 tls 的空间，但是需要将这部分空间的起始地址存储到指定的寄存器中，后续才能通过 `pthread_self()` 获取 tls 数据，因此需要开启该 feature。

RuxOS 会主动的拉取并编译 musl libc 的源码，用户目前只能针对 `ARCH=aarch64` 使用 musl libc，因为目前仅对 A64 进行了系统调用号的匹配。

编译、链接过程与 ruxlibc 类似，在使用 ruxlibc 的时候，会在 `target/` 目录下生成一个 `.a` 文件，而 musl libc 会在 musl 目录的 `install/` 生成 `libc.a` 文件，使用该文件进行链接即可（无需应用额外做该工作，已集成到 makefile 中）。
