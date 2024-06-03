# 现有应用及编程语言支持

借助 RuxOS 提供的 [ruxlibc](../../chap07/ulib/ruxlibc.md) 或 [ruxmusl](../../chap07/ulib/ruxmusl.md) 支持的标准 musl libc， RuxOS 完成了许多应用和编程语言的集成。

应用的适配思路为：

- 静态链接。借助 ruxlibc 或者 musl libc 对应用源码进行静态编译，再链接内核的相关静态库，并放到 QEMU 中运行。
- 动态链接。借助 RuxOS 提供的[动态链接器](../ELF-loader.md)动态链接应用的 ELF 文件，其中要求该 ELF 基于 musl gcc 进行编译生成。

编程语言适配思路：

- 支持相关解释器。以 Python 为例，通过支持 cpython 解释器来运行 Python 终端和相关的 Python 文件。
- 支持相关标准库。以 Rust 为例，通过标准 musl libc 支持 Rust std，进而支持 Rust 应用。

本小节包括：

- [helloworld](./helloworld.md)
- [Iperf3](./iperf.md)
- [Sqlite](./sqlite.md)
- [Redis](./redis.md)
- [Nginx](./nginx.md)
- [Wamr](./wamr.md)
- [Perl](./perl.md)
