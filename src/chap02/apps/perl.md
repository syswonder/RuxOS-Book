# Perl

RuxOS 支持在 Qemu 上运行 [perl](https://www.perl.com/) 程序。

## 实现方式:
为了在Rux OS操作系统上实现对perl语言的支持，首先利用了RuxOS已经集成的Musl-libc。Musl-libc是一个轻量级的C标准库，它为perl提供了必要的运行时环境。通过使用Musl-GCC编译器对perl的源代码进行编译，使得perl能够在RuxOS上运行。
将编译好的perl二进制文件以及它所需的所有动态库一起放入系统的root文件系统（rootfs）中。通过这种方式，perl可以在RuxOS上通过动态链接的方式运行。

## 简单测试程序:
### 第一步:
首先搭建好 [RuxOS](https://github.com/syswonder/ruxos) 的环境。
### 第二步:
进入RuxOS的根目录，输入以下命令，该命令将拉取 perl 相关的文件到 `apps/c/rux-perl` 目录下。并运行helloworld程序。
  
```bash
git clone https://github.com/syswonder/rux-perl.git ./apps/c/rux-perl
make A=apps/c/rux-perl ARCH=aarch64 V9P=y NET=y MUSL=y SMP=1 run
```
结果如下，会输出一行hello,perl!

```bash
8888888b.                     .d88888b.   .d8888b.  
888   Y88b                   d88P" "Y88b d88P  Y88b 
888    888                   888     888 Y88b.      
888   d88P 888  888 888  888 888     888  "Y888b.   
8888888P"  888  888 `Y8bd8P' 888     888     "Y88b. 
888 T88b   888  888   X88K   888     888       "888 
888  T88b  Y88b 888 .d8""8b. Y88b. .d88P Y88b  d88P 
888   T88b  "Y88888 888  888  "Y88888P"   "Y8888P" 

arch = aarch64
platform = aarch64-qemu-virt
target = aarch64-unknown-none-softfloat
smp = 1
build_mode = release
log_level = warn

[1716796042.017428 0 axfs_ramfs::dir:55] AlreadyExists sys
[1716796042.199408 0:2 ruxos_posix_api::imp::fd_ops:182] unsupported fcntl parameters: cmd 1
[1716796042.215760 0:2 ruxos_posix_api::imp::fd_ops:182] unsupported fcntl parameters: cmd 1
Hello, perl!
```
## 运行用户程序:
rux-perl的结构如下
```bash
rux-perl
├── axbuild.mk
├── config_linux.toml
├── features.txt
├── main.c
├── README.md
├── rootfs
│   ├── dev
│   ├── etc
│   ├── lib                         //perl所需的动态库
│   │   ├── ld-linux-armhf.so.3
│   │   └── ld-musl-aarch64.so.1
│   ├── perl                        //perl可执行文件
│   ├── proc
│   ├── sys
│   ├── tmp
│   ├── usr                         //perl所需的环境变量
│   │   └── local
│   │       └── lib
│   │           └── perl5
│   └── your_perl.t                 //默认运行的hello,perl程序
├── test_perl.sh
└── test.py
```
在 `axbuild.mk`中有一行：
```bash
ARGS = perl,your_perl.t
```
可以将 `your_perl.t` 换成想运行的`xxx.t`程序

## perl的测试相关
因为RuxOS 目前并不支持`fork()` ，所以我用了一些方法来运行官方测试程序
如果你想运行perl的测试程序，首先将  `main.c` 中的一些注释给取消，这些是用于io重定向的 :
```c
  // The following section of code is used only during Perl testing:

  // int fd = open("test_result.txt", O_WRONLY | O_CREAT | O_APPEND, 0644);
  // char *data = argv[1];
  // // wirte test filename
  // write(fd, "\n", 1);
  // write(fd, data, strlen(data));
  // write(fd, "\n", 1);
  // if (fd == -1) {
  //     perror("open failed");
  //     return 1;
  // }
  // // io redirect
  // if (dup2(fd, STDOUT_FILENO) == -1) {
  //     perror("dup2 failed");
  //     return 1;
  // }
  // chdir("/perl-5.38.2");
```
然后在RuxOS的根目录下运行:

```bash
sh apps/c/rux-perl/test_perl.sh
```
最后测试结构会保存在 `/rux-perl/test_result.txt`中

### 测试脚本解释
`test_perl.sh`中首先会去下载 perl 的源码，这其中就包括了我们要运行的测试程序
然后调用`test.py`来进行测试
`test.py`中首先定义了要测试的文件夹，然后遍历文件夹，找到其中以 .t 为结尾的文件
```python
folders = ["./apps/c/rux-perl/rootfs/perl-5.38.2/t/base"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/class"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/cmd"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/io"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/japh"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/mro"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/opbasic"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/re"
            ,"./apps/c/rux-perl/rootfs/perl-5.38.2/t/comp"]
```
然后对每个单独的 .t 文件都启动一个 RuxOS 来运行。
```python
os.system(f"make A=apps/c/rux-perl ARCH=aarch64 V9P=y NET=y MUSL=y SMP=1 ARGS=perl,{file} run")
```
部分结果如下,会输出测试的脚本名称，以及测试的结果。
```
test result:
/perl-5.38.2/t/base/if.t
1..2
ok 1 - if eq
ok 2 - if ne

/perl-5.38.2/t/base/pat.t
1..2
ok 1 - match regex
ok 2 - match regex

/perl-5.38.2/t/base/while.t
1..4
ok 1
ok 2
ok 3
ok 4

...
```
