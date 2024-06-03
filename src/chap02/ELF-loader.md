
# 动态加载应用二进制

ELF Loader: 使 RuxOS 能够运行未经修改的 Linux ELF 应用。
- ELF 必须是 PIE。
- 支持静态和动态 PIE ELF, 前者使用 `-static-pie` 编译。

目前支持运行 Musl 编译的 x86_64 和 aarch64 Linux 的静态和动态 PIE 应用。

接下来以 AArch64 架构为例, 说明如何使用。

## 快速开始

提供了两种构建方式。

### 使用 RuxGo 构建

>  RuxGo 是 RuxOS 的配套工具。

```sh
# 安装 RuxGo
cargo install --git https://github.com/syswonder/ruxgo.git ruxgo

# 克隆 RuxOS 的仓库
git clone https://github.com/syswonder/ruxos
cd ruxos

# 进入示例程序目录
cd apps/c/dl

# 编译依赖库和应用
musl-gcc rootfs/libadd.c -shared -o rootfs/lib/libadd.so
musl-gcc rootfs/hello.c -o rootfs/bin/hello -Lrootfs/lib -ladd

# 复制 musl 动态链接器
cp /path/to/ld-musl-aarch64.so.1 rootfs/lib/

# 编译并运行
ruxgo -b && ruxgo -r
```

### 使用 make 构建

```sh
# 克隆 RuxOS 的仓库
git clone https://github.com/syswonder/ruxos
cd ruxos

# 进入示例程序目录
cd apps/c/dl

# 编译依赖库和应用
musl-gcc rootfs/libadd.c -shared -o rootfs/lib/libadd.so
musl-gcc rootfs/hello.c -o rootfs/bin/hello -Lrootfs/lib -ladd

# 回到 RuxOS 主目录
cd -

# 复制 musl 动态链接器
cp /path/to/ld-musl-aarch64.so.1 apps/c/dl/rootfs/lib/

# 编译并运行
make run ARCH=aarch64 A=apps/c/dl/ V9P=y MUSL=y
```

### 如何生成 musl 动态链接器

一般来说, 可以从很多地方(如[musl.cc](https://musl.cc))里获取预编译的二进制文件, 但也可以从源码自行编译, 如:

```sh
# 下载源码
mkdir musl_src
cd musl_src
wget https://musl.libc.org/releases/musl-1.2.3.tar.gz 
tar -zxvf musl-1.2.3.tar.gz && rm -f musl-1.2.3.tar.gz

# 编译
mkdir bld
cd bld
../musl-1.2.3/configure --prefix=../install --exec-prefix=../ --syslibdir=../install/lib ARCH=aarch64 
make -j && make install

# 编译完成
cd ../install
ls ./lib/
```

此时应该能得到名为 `libc.so` 的动态链接器, 改为所需名字即可(如`ld-musl-aarch64.so.1`).


## 目录结构

在 RuxOS 的 `apps/c/dl` 下的文件如下所示:
- `rootfs/`: 用作 9pfs 根文件系统.
- `features.txt`, `axbuid.mk`: make 构建的配置文件.
- `main.c`: make 构建的运行入口.
- `config_linux.toml`: RuxGo 配置文件. 

`config_linux.toml` 内容如下, 其中相关的参数已给出注释, 其他参数请参考 RuxGo 文档.

```toml
[build]
compiler = "gcc"
loader_app = [
    "y",       
    "/bin/hello"   # app 在根文件系统中的路径
] 

[os]
name = "ruxos"
services = [  # RuxOS features
    "alloc",
    "paging",
    "musl",
    "multitask",
    "fs",
    "virtio-9p",
]
ulib = "ruxmusl"

[os.platform]
name = "aarch64-qemu-virt" 
mode = "release"
log = "warn"

[os.platform.qemu]
v9p = "y"               # 使用 9pfs
v9p_path = "./rootfs"   # 9pfs 根文件系统路径
args = "/bin/hello"         # 参数, 一般第一个是程序名
envs = ""               # 环境变量
```

`axbuild.mk` 的内容如下

```makefile
app-objs=main.o

# 参数
ARGS = /bin/hello
# 环境变量
ENVS =                 
# 9pfs 根文件系统路径
V9P_PATH=${APP}/rootfs
```

RuxOS features 放在 `features.txt` 里, 内容如下:

```
paging
alloc 
musl
multitask
fs
virtio-9p
```

`rootfs/` 存储了一个文件系统, 通过 9pfs 使用,.
- 使用 ldd 列出依赖的共享库. 
- 将 ELF 和必需的配置文件和库依赖复制到相同子目录中.

以 `rootfs/bin/hello` 为例(源码为 `rootfs/hello.c`)

```sh
/$ ldd rootfs/bin/hello
    /lib/ld-musl-aarch64.so.1 (0x5500000000)
    libc.musl-aarch64.so.1 => /lib/ld-musl-aarch64.so.1 (0x5500000000)
```

因此, 应该将 `ld-musl-aarch64.so.1` 放到 `rootfs/lib/` 下.

之后便可以编译并运行.

> 对于动态 ELF, ELF loader 会加载 app 和动态链接器 (`ld-musl-aarch64.so.1`), 由它为 app 加载动态库. 


# 调试

## GDB

> 为了让 gdb 加载符号, 必须让它知道应用的内存布局, 即应用被加载到的地址.

修改 log 等级为 debug, 先运行一次, 可以得到 ELF 代码段被加载到的基地址, 例如:

```
[1712997884.096284 0:2 ruxos_posix_api::imp::execve::load_elf:91] sys_execve: loaded ELF in 0xffff800000000000, .text is 0xffff800000000440
```

获取到基地址后, 启动调试会话:

```sh
make debug ARCH=aarch64 A=apps/c/dl V9P=y MUSL=y 
```

在 GDB 上加载符号:

```
(gdb) add-symbol-file -readnow apps/c/dl/rootfs/bin/hello 0xffff800000000440 
```

## 获取动态库的地址

对于动态链接的 ELF, 还会额外加载依赖的动态库.

对于每个动态库, 动态链接器会: 
- 打开文件
- 解析 ELF 头
- 将需要的部分映射到内存
- 关闭文件

其中映射到内存这一步是通过 mmap 来完成的.

假设动态库为 `libadd.so`, 可以如下操作:
- 设置 log 等级为 debug, 运行应用
- 观察系统调用, 发现对 `libadd.so` 的 `sys_open`
- 观察接下来的 `sys_mmap`: 如果参数 `prot` 里带有 `PROT_EXECUTE`, 则为代码段, 其返回值即为基址.

```sh
[1713000565.192311 0:2 ruxos_posix_api::imp::fs:208] sys_openat <= -100, Ok("/lib/libadd.so"), 0o2400000 0o0
...
[1713000566.196263 0:2 ruxos_posix_api::imp::fs:209] sys_openat => Ok(3)
...
[1713000566.201834 0:2 ruxos_posix_api::imp::mmap::api:42] sys_mmap <= start: 0x0, len: 0x12000, prot:0x5, flags:0x2, fd: 3
[1713000566.202289 0:2 ruxos_posix_api::imp::mmap::api:46] sys_mmap => Ok(0xffff8000000d7000)
```

> 还可以用 `directory` 命令使源码对 gdb 可见.


# ELF loader 执行过程

## execv

最开始是一个 `execv()` 调用.
- 这是个标准库函数
- 他会调用 `sys_execve()` 系统调用来完成工作.

## sys_execve

系统调用原型:

```c
int execve(const char *pathname, char *const argv[], char *const envp[] );
```

主要完成以下工作
1. 根据 `pathname`, 加载 ELF 文件, 使用 mmap 将其 LOAD 段的内容映射到内存里.
2. 解析 ELF 头, 如果有 INTERP 段, 说明是动态链接程序, 则将动态链接器也加载到内存里.
3. 申请一个新的栈, 构造辅助向量, 将其和环境变量和参数一起推到新的栈里, 最后推入 argc.
4. 修改栈指针寄存器为新栈顶.
5. 跳转到程序入口处执行, 如果是动态链接的程序, 则跳转到动态链接器的入口.

此时新栈的内容类似于(详阅[这篇文章](https://lwn.net/Articles/631631/)): 

```
    ------------------------------------------------------------- 0x7fff6c845000
     0x7fff6c844ff8: 0x0000000000000000
            _  4fec: './stackdump\0'                      <------+
      env  /   4fe2: 'ENVVAR2=2\0'                               |    <----+
           \_  4fd8: 'ENVVAR1=1\0'                               |   <---+ |
           /   4fd4: 'two\0'                                     |       | |     <----+
     args |    4fd0: 'one\0'                                     |       | |    <---+ |
           \_  4fcb: 'zero\0'                                    |       | |   <--+ | |
               3020: random gap padded to 16B boundary           |       | |      | | |
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|       | |      | | |
               3019: 'x86_64\0'                        <-+       |       | |      | | |
     auxv      3009: random data: ed99b6...2adcc7        | <-+   |       | |      | | |
     data      3000: zero padding to align stack         |   |   |       | |      | | |
    . . . . . . . . . . . . . . . . . . . . . . . . . . .|. .|. .|       | |      | | |
               2ff0: AT_NULL(0)=0                        |   |   |       | |      | | |
               2fe0: AT_PLATFORM(15)=0x7fff6c843019    --+   |   |       | |      | | |
               2fd0: AT_EXECFN(31)=0x7fff6c844fec      ------|---+       | |      | | |
               2fc0: AT_RANDOM(25)=0x7fff6c843009      ------+           | |      | | |
      ELF      2fb0: AT_SECURE(23)=0                                     | |      | | |
    auxiliary  2fa0: AT_EGID(14)=1000                                    | |      | | |
     vector:   2f90: AT_GID(13)=1000                                     | |      | | |
    (id,val)   2f80: AT_EUID(12)=1000                                    | |      | | |
      pairs    2f70: AT_UID(11)=1000                                     | |      | | |
               2f60: AT_ENTRY(9)=0x4010c0                                | |      | | |
               2f50: AT_FLAGS(8)=0                                       | |      | | |
               2f40: AT_BASE(7)=0x7ff6c1122000                           | |      | | |
               2f30: AT_PHNUM(5)=9                                       | |      | | |
               2f20: AT_PHENT(4)=56                                      | |      | | |
               2f10: AT_PHDR(3)=0x400040                                 | |      | | |
               2f00: AT_CLKTCK(17)=100                                   | |      | | |
               2ef0: AT_PAGESZ(6)=4096                                   | |      | | |
               2ee0: AT_HWCAP(16)=0xbfebfbff                             | |      | | |
               2ed0: AT_SYSINFO_EHDR(33)=0x7fff6c86b000                  | |      | | |
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        | |      | | |
               2ec8: environ[2]=(nil)                                    | |      | | |
               2ec0: environ[1]=0x7fff6c844fe2         ------------------|-+      | | |
               2eb8: environ[0]=0x7fff6c844fd8         ------------------+        | | |
               2eb0: argv[3]=(nil)                                                | | |
               2ea8: argv[2]=0x7fff6c844fd4            ---------------------------|-|-+
               2ea0: argv[1]=0x7fff6c844fd0            ---------------------------|-+
               2e98: argv[0]=0x7fff6c844fcb            ---------------------------+
     0x7fff6c842e90: argc=3
```


