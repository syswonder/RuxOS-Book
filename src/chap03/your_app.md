
# 自定义应用

本章节将包含如何将您的应用在 RuxOS 上运行起来，下面介绍的均为从源码编译、运行，更便捷的方式是[动态加载应用二进制文件](../chap02/ELF-loader.md)。

## C 应用

RuxOS 对于 C 应用的支持是比较完善的，根据以下步骤即可完成：

- 将对应的 C 应用源码放到指定的路径，并声明所需要使用的内核 feature。
  
  集成 C 应用的时候，有两个重要的文件：`axbuild.mk` 与 `features.txt`，前者用于指定需要编译的 C 文件和在编译 C 文件的时候需要提供的编译参数，用于将 C 源文件编译成目标文件后，与内核链接在一起，生成统一的二进制文件。后者用于声明该 C 应用所需要的内核特征，用于对内核进行裁剪。所有的 feature 在 RuxOS 的源码中 `api/ruxfeat` 中进行了定义。

- 选取需要使用的 C 标准库，RuxOS 提供了两种 C 标准库，分别是以直接函数调用支持的 ruxlibc 和以系统调用形式支持的标准 musl libc，只需要添加 `MUSL=y` 编译选项即可。

- 参考编译命令：

  ```shell
  make run A=<arg1> MUSL=<arg2> ARCH=<arg3> LOG=<arg4> ARGS=<arg5> NET=<arg6> V9P=<arg7> V9P_PATH=<arg8> BLK=<arg9> SMP=<arg10>
  ``` 
  - **arg1**：应用相对于当前终端的路径。

  - arg2：y/n，y 表示使用 musl libc，默认为 n。

  - arg3：目标架构，默认为 x86_64，可选 aarch64/riscv64。

  - arg4：日志等级，可选 error/warn/info/debug/trace，默认为 warn。

  - arg5：应用所需参数，对应 main 函数中的 argv变量，以逗号分隔，不支持空格。

  - arg6：y/n，y 表示使用网络设备，默认为 n。

  - arg7：y/n，y 表示使用 9pfs，默认为 n。

  - arg8：使用 9pfs 时共享目录的路径。**在未开启 `blkfs` feature 时，该共享目录会挂载到 RuxOS 的根目录上，否则挂载到 `/9pfs/` 路径**。

  - arg9：y/n，y 表示使用块设备，默认为 n。

  - arg10：核数，大于1会开启 `smp` feature，执行多核环境。

## 其他语言应用

### 解释型语言

解释型语言，以 python 为例，需要支持对应的解释器，然后由解释器去加载、运行源文件。

此时，只需要将解释器源码像上述 C 应用一样进行合理的放置和配置，通过 `ARGS` 参数来传递相关的应用路径即可，推荐借助 9pfs 共享目录。

### 带标准库的语言

以 Rust 为例，需要通过 musl libc 支持 Rust std，并将支持的 Rust std 与内核、应用链接到一起即可。


