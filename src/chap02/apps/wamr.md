# WAMR

RuxOS 支持在 Qemu 上通过wasm运行时 [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime)来运行wasm应用。

## 1. WAMR简介

WAMR是一个轻量级的wasm运行时，支持在嵌入式设备上运行wasm应用。RuxOS提供了Hello World和2048小游戏的wasm应用作为示例，同时支持WASI-NN，具有运行神经网络模型的能力。

将[rux-wamr](https://github.com/syswonder/rux-wamr)克隆到RuxOS项目的apps/c/wamr目录下，有如下结构：

```txt
├── axbuild.mk
├── CMakeLists.txt
├── features.txt
├── README.md
├── rootfs
│   ├── ...
├── wamr.patch
```

## 2. 编译WAMR并运行示例

WAMR的编译依赖于cmake，所以在编译WAMR之前需要安装cmake。

在RuxOS根目录运行下面的命令，会启动hello world的wasm应用。

```shell
make A=apps/c/wamr ARCH=aarch64 LOG=info SMP=4 MUSL=y NET=y V9P=y V9P_PATH=apps/c/wamr/rootfs ARGS="iwasm,/main.wasm" run
```

参数解释：

* `A`: 该参数指向 WAMR 应用所在的目录。

* `ARCH`: `ARCH` 表示将 RuxOS 运行在何种架构上，可选架构参数包括: `x86_64`, `aarch64`, `riscv64`.

* `LOG`: `LOG` 表示输出的日志等级，更低的日志等级意味着更详细的输出。可选包含：`error`,  `warn`, `info`, `debug`, `trace`。

* `SMP`: `SMP` 用于使能 RuxOS 的多核 feature，紧跟着的数字表示启动的核数。

* `MUSL`: 该参数表示使用musl libc作为编译时的c库。

* `NET`: 该参数用于使能 qemu 的 virtio-net。

* `V9P`: 该参数用于使能 qemu 的 virtio-9p。

* `V9P_PATH`: `V9P_PATH` 指向 host 上的用于共享的目录，这里使用rux-wamr的rootfs目录，其中包含了wasm应用的wasm文件。

* `ARGS`: `ARGS` 提供wasm应用运行所需要的参数。这里表示用iwasm可执行文件解释执行wasm字节码文件`/main.wasm`。若要运行2048小游戏，将`/main.wasm`改为`/2048.wasm`即可。

输入wasd以控制，运行2048小游戏的界面如下：

![2048](img/2048.png)

若需要将参数传递给wasm应用的main函数，可以在`/main.wasm`后面添加参数，如`iwasm,/main.wasm,--help`。

若需要将参数传递给iwasm，如指定给iwasm的环境变量，可将其放在iwasm之后，/main.wasm之前，如`iwasm,--env="xxx=yyy",/main.wasm`。

## WASI-NN

如果需要在WAMR中使用NN（神经网络）支持，需要运行带`WASI_NN=1`参数的`make`命令：

```shell
make A=apps/c/wamr ARCH=aarch64 LOG=info SMP=4 MUSL=y NET=y V9P=y V9P_PATH=apps/c/wamr/rootfs WASI_NN=1 ARGS="iwasm,/main.wasm" run
```

## 3. 运行自己的wasm应用

wasm具有跨平台的特性，所以在RuxOS上可以直接运行在本机上编译好的wasm应用。想要运行自己的wasm应用，只需要在本地编译好wasm应用，将wasm文件放到rux-wamr的rootfs目录下，然后修改上述命令的`ARGS`参数即可运行。

这里使用[WASI-SDK](https://github.com/WebAssembly/wasi-sdk)编译wasm应用。首先下载WASI-SDK并解压到合适的目录，然后运行类似下面的命令编译wasm应用：

```shell
$WASI_SDK_DIR/bin/clang -O3 -o main.wasm main.c
```

编译完成后将main.wasm文件放到rux-wamr的rootfs目录下即可。

例如，如果你想自己编译支持神经网络的测试用例，可以在`apps/c/wamr/wasm-micro-runtime-{version}/core/iwasm/libraries/wasi-nn/test/`目录中使用如下命令：

```bash
/opt/wasi-sdk/bin/clang \
    -Wl,--allow-undefined \
    -Wl,--strip-all,--no-entry \
    --sysroot=/opt/wasi-sdk/share/wasi-sysroot \
    -I../include -I../src/utils \
    -o test_tensorflow.wasm \
    test_tensorflow.c utils.c
```

然后复制`test_tensorflow.wasm`到`apps/c/wamr/rootfs`目录下即可：

```bash
cp test_tensorflow.wasm ../../../../../../rootfs/
```
运行上述`make`命令体验在RuxOS上运行神经网络模型。
