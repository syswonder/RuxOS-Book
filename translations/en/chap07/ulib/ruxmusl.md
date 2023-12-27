# ruxmusl

This section mainly covers the process of integrating [musl libc](https://www.musl-libc.org/) into RuxOS. RuxOS uses a compatibility layer to adapt musl libc, ultimately passing the [libc-bench](https://git.musl-libc.org/cgit/libc-bench/) tests.

## From musl libc to Syscall Layer

### Importance of Introducing musl libc

`musl libc` provides many APIs essential for C applications and encapsulates system calls in the kernel. However, not all functions need system calls. A large number of functions, such as string processing, do not require system calls. `musl libc` provides relatively complete, efficient, and well-tested implementations for these functions.

Therefore, by integrating `musl libc` into RuxOS, many functions, including string processing, will no longer need additional implementations in the kernel. In the parallel implementation [ruxlibc](./ruxlibc.md), these functions need to be implemented one by one, introducing a more cumbersome workload and a higher likelihood of errors.

### System Calls and System Call Numbers

System calls are a set of portable APIs defined by the kernel. Depending on the architecture, system call numbers corresponding to the system calls may differ. In AARCH64, you can check the system call numbers in the `path/to/musl-libc/arch/aarch64/bits/syscall.h.in` file.

Comparing system calls on different architectures, it's evident that not only do system call numbers differ, but also the types of system calls. For example, AARCH64 provides two system calls, `dup` and `dup3`, without providing `dup2`. However, x86_64 provides all three of these system calls.

### Triggering Synchronous Exceptions

How does the execution transition from libc functions to the kernel's syscall layer? Taking the `read()` function as an example:

- `read()` is the read function provided by the C standard library, and its implementation is in `path/to/musl-libc/src/unistd/read.c`. In this function, it calls `syscall_cp(SYS_read, fd, buf, count)`, which contains a macro defined in `path/to/musl/arch/aarch64/syscall_arch.h`. This macro uses `svc 0` to perform the system call. It stores the relevant parameters in `x0~x5` and the system call number in `x8`. In other words, system calls support up to six parameters.

- `svc 0` triggers a synchronous exception, forcing the kernel to jump to the exception vector table, look up, and jump to the synchronous exception handling function defined by the kernel.

## Syscall Handling (A64)

### Parsing Parameters

Synchronous exceptions enter the `handle_sync_exception()` function defined in `modules/ruxhal/src/arch/aarch64/trap.rs`. Here, the exception status information is obtained by parsing the `ESR` register. Then, by reading `x0~x5` and `x8`, the syscall parameters and syscall number are obtained, and the syscall processing function is entered.

When the `musl` feature is enabled, the `TrapHandler` trait in `modules/ruxhal/src/trap.rs` adds the `handle_syscall()` method. The implementation is in `ulib/ruxmusl/src/trap.rs`. Here, the syscall number is parsed, and it is dispatched to specific handling functions.

### Syscall Dispatching

The dispatching process is defined in `ulib/ruxmusl/src/syscall/mod.rs`. The syscall numbers correspond to the standard A64 syscall numbers and are defined in `ulib/ruxmusl/src/syscall/syscall_id.rs`. However, there are currently some missing syscalls, and these will be addressed in the future. The dispatching process involves matching syscall numbers and parsing incoming parameters into different types. Then, the specific syscall is called in [`ruxos-posix-api`](./ruxos-posix-api.md).

## Using ruxmusl

RuxOS provides a convenient way for users to use musl libc through the makefile. When compiling and running C programs, you only need to add `MUSL=y`.

When using musl libc, some features need to be forcibly defined. RuxOS has integrated these into the makefile, so there is no need for additional work:

- **fp_simd**: Since musl libc needs to compile all C standard library functions, including `double` and other floating-point types, this feature needs to be enabled.

- **fd**: Since musl libc needs to initialize stdin/stdout/stderr, this feature needs to be enabled by default.

- **tls**: musl libc manages tls on its own. When creating a new thread, it reserves space for tls using `mmap`. However, to get the starting address of this space into the designated register, it needs to be stored in `x18`. Therefore, this feature needs to be enabled.

RuxOS actively fetches and compiles musl libc source code. Currently, users can only use musl libc for `ARCH=aarch64` because syscall number matching is only implemented for A64.

The compilation and linking process is similar to ruxlibc. When using ruxlibc, a `.a` file is generated in the `target/` directory. For musl libc, the `libc.a` file is generated in the `install/` directory of the musl folder. This file is used for linking (no need for users to do this, as it is integrated into the makefile).
