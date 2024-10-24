
# 环境配置说明

除了基础的 Linux 环境及相关工具链（包括GCC）外，还需要用户进行下面的环境配置。

### Rust 基础环境

在使用 RuxOS 前，需要用户自行配置 Rust 相关编程环境以及工具链。[参考这里](https://www.rust-lang.org/)安装好 Rust 环境与 cargo 工具。

通过以下两条命令判断是否安装好 Rust 环境与 cargo 工具：

```bash
rustc --version
cargo --version
```

RuxOS 需要在 nightly 版本的 Rust 环境中运行和开发，完成如上工作后，在 RuxOS 源码中会自动切换和拉取指定版本的 Nightly Rust。

### Rust 相关二进制工具链

参考下面的教程，在 Ubuntu 上安装工具链。

为了使用`rust-objcopy`和`rust-objdump`，需要安装[cargo-binutils](https://github.com/rust-embedded/cargo-binutils)：

```bash
cargo install cargo-binutils
```

部分 Rust 库使用到了 clang ，需要安装相关依赖：

```bash
sudo apt install libclang-dev
```

### musl 工具链

RuxOS 通过 musl gcc 来完成相关应用的编译，通过 [musl libc](https://www.musl-libc.org/) 来支持相关应用和编程语言。

下载并安装 musl 交叉编译工具链:

```bash
# 在合适的目录下载

wget https://musl.cc/aarch64-linux-musl-cross.tgz
wget https://musl.cc/riscv64-linux-musl-cross.tgz
wget https://musl.cc/x86_64-linux-musl-cross.tgz

# 安装

tar zxf aarch64-linux-musl-cross.tgz
tar zxf riscv64-linux-musl-cross.tgz
tar zxf x86_64-linux-musl-cross.tgz

# 添加临时环境变量或写入 ~/.bashrc 文件。将其中`pwd`换成合适路径。

export PATH=`pwd`/x86_64-linux-musl-cross/bin:`pwd`/aarch64-linux-musl-cross/bin:`pwd`/riscv64-linux-musl-cross/bin:$PATH

```
