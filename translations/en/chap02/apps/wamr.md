# WAMR

RuxOS supports running wasm applications on Qemu through wasm runtime [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime).

## 1. Introduction to WAMR

WAMR is a lightweight wasm runtime that supports running wasm applications on embedded devices. RuxOS provides wasm applications of Hello World and 2048 game as examples.

Clone [rux-wamr](https://github.com/syswonder/rux-wamr) to the apps/c/wamr directory of the RuxOS project, with the following structure:

```shell
wamr
├── rootfs
│   ├── 2048.c
│   ├── 2048.wasm
│   ├── main.c
│   └── main.wasm
├── CMakeLists.txt
├── README.md
├── axbuild.mk
├── features.txt
└── wamr.patch
```

## 2. Compile WAMR and run the example

WAMR compilation depends on cmake, so cmake needs to be installed before compiling WAMR.

Run the following command in the RuxOS root directory, which will start the hello world wasm application.

```shell
make A=apps/c/wamr ARCH=aarch64 LOG=info SMP=4 MUSL=y NET=y V9P=y V9P_PATH=apps/c/wamr/rootfs ARGS="iwasm,/main.wasm" run
```

Parameter explanation:

* `A`: This parameter points to the directory where the WAMR application is located.

* `ARCH`: `ARCH` indicates on which architecture RuxOS is running, and the optional architecture parameters include: `x86_64`, `aarch64`, `riscv64`.

* `LOG`: `LOG` indicates the output log level, and a lower log level means more detailed output. Optional include: `error`, `warn`, `info`, `debug`, `trace`.

* `SMP`: `SMP` is used to enable the multi-core feature of RuxOS, followed by the number of cores started.

* `MUSL`: This parameter indicates that musl libc is used as the c library at compile time.

* `NET`: This parameter is used to enable qemu's virtio-net.

* `V9P`: This parameter is used to enable qemu's virtio-9p.

* `V9P_PATH`: `V9P_PATH` points to the directory on the host used for sharing. Here, the rootfs directory of rux-wamr is used, which contains the wasm file of the wasm application.

* `ARGS`: `ARGS` provides the parameters required for the wasm application to run. Here, the iwasm executable file is used to interpret the wasm bytecode file `/main.wasm`. If you want to run the 2048 game, change `/main.wasm` to `/2048.wasm`. If you need to pass parameters to the main function of the wasm application, you can add parameters after `/main.wasm`, such as `iwasm,/main.wasm,--help`.

The interface of running the 2048 game is as follows:

![2048](img/2048.png)

## 3. Run your own wasm application

wasm has the characteristics of cross-platform, so the wasm application can be compiled on the host and then run on RuxOS. To run your own wasm application, you only need to put the wasm file in the rootfs directory of rux-wamr, and then modify the ARGS parameter in the above command to run the wasm application.

Here, we use [WASI-SDK](https://github.com/WebAssembly/wasi-sdk) to compile the wasm application. First download WASI-SDK and unzip it to a suitable directory, and then run the following command to compile the wasm application:

```shell
$WASI_SDK_DIR/bin/clang -O3 -o main.wasm main.c
```

After the compilation is completed, put the main.wasm file in the rootfs directory of rux-wamr to run it.
