
# 环境配置说明

在使用 RuxOS 前，需要用户自行配置 Rust 相关编程环境以及工具链。[参考这里](https://www.rust-lang.org/)安装好 cargo。

参考下面的教程，在 Ubuntu 上安装工具链。

为了使用`rust-objcopy`和`rust-objdump`，需要安装[cargo-binutils](https://github.com/rust-embedded/cargo-binutils)：

```bash
cargo install cargo-binutils
```

部分 Rust 库使用到了 clang ，需要安装相关依赖：

```bash
sudo apt install libclang-dev
```

下载并安装 musl 交叉编译工具链:
```
# 在合适的目录下载

wget https://musl.cc/aarch64-linux-musl-cross.tgz
wget https://musl.cc/riscv64-linux-musl-cross.tgz
wget https://musl.cc/x86_64-linux-musl-cross.tgz

# 安装

tar zxf aarch64-linux-musl-cross.tgz
tar zxf riscv64-linux-musl-cross.tgz
tar zxf x86_64-linux-musl-cross.tgz

# 添加临时环境变量或写入 ~/.bashrc 文件

export PATH=`pwd`/x86_64-linux-musl-cross/bin:`pwd`/aarch64-linux-musl-cross/bin:`pwd`/riscv64-linux-musl-cross/bin:$PATH

```
