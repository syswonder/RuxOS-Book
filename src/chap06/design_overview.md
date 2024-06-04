
# 设计概述

本章节将对 RuxOS 的结构进行介绍。

RuxOS 整体结构如下图所示：

<p align="center">
    <img src="../figures/ruxos.svg" alt="RuxOS-Structure" width="500">
</p>

下面自下而上进行简要介绍，并在后面章节中对具体模块进行详细介绍。

### Hypervisor

RuxOS 底层运行在虚拟机监控器上，目前运行在 QEMU 中，后续将与矽望社区自研的 Hvisor 进行对接。

### 底层组件 [RuxOS Crates](./crates/crates.md)

该层包含操作系统底层相互独立的功能组件，各个组件以 Rust Crate 的形式独立存在，互不依赖，与具体操作系统无关，可在多个操作系统之间进行共享。这是基于组件化操作系统理念设计的层级结构，底层组件的独立是内核裁剪的基础。

例如，在底层组件中独立实现了各类内存分配算法，上层的具体操作系统模块可以进行自由选择，来构建自己操作系统的内存分配器。

### 功能模块 [RuxOS Modules](./modules/modules.md)

该层包含了 RuxOS 自身的操作系统模块，基于底层的独立组件进行组合、封装，构成操作系统内核的重要部分。

功能模块这一层与具体的操作系统相关，里面包含了具体操作系统的功能子模块初始化，例如网络、调度、内存分配等，也包括了具体操作系统的参数，例如地址空间大小、虚拟地址起始位置、网络端口等，是不可共享的部分。

### 特征选择 ruxfeat

基于 Unikernel 的设计理念，将内核模块构建为可裁剪、可定制的形式，需要使用 Rust Feature 机制。ruxfeat 模块用于对内核中繁杂、细碎的 Feature 进行整合和统一管理，对上层提供整合过后简洁的特征集，用于 API 层进行特征选择。

### API 层 RuxOS API

API 层提供的是用户库的兼容层，里面包含了 Rust 兼容层和 POSIX 兼容层。其中 Rust 兼容层目前用于支持 Rust 标准库，后续将会统一通过 musl libc 来进行支持。POSIX 兼容层提供的是 POSIX 规范的系统调用接口，细节及实现情况在[这里](../chap07/ulib/ruxos-posix-api.md)进行了详细说明。

### 用户库 RuxOS ulib

目前 RuxOS 中包含三类用户库，分别是：

- 移植 ArceOS 的 Rust 标准接口库 axstd，提供部分的 Rust 标准库模块，能支持简单的 Rust 应用，以直接函数调用的形式实现。

- 基于 C 语言和 Rust 语言自研的 [ruxlibc](../chap07/ulib/ruxlibc.md) 标准库，提供标准 C 语言的 API，以直接函数调用形式实现。

- 通过 [ruxmusl](../chap07/ulib/ruxmusl.md) 兼容层支持的标准 musl libc 标准库，以标准系统调用的形式实现。

应用程序可以根据需求选择合适的标准库。

### 应用程序 User Apps

该层为标准的应用程序，应用程序与编程语言支持情况在[第二章](../chap02/apps/root.md)中进行了展示。

