
<p align="center">
    <img src="figures/ruxos-logo0.svg" alt="RuxOS-logo" width="400"><br>
</p>


# 欢迎使用 RuxOS！

该项目为 RuxOS 手册，面向应用开发者和内核开发者，包含以下内容：

* RuxOS 概述

* 使用 RuxOS 运行应用

* RuxOS 整体设计

RuxOS 手册仍在完善中。

# RuxOS 是什么？

RuxOS（如意一体操作系统）是一个兼容 Linux 应用的轻量化库操作系统，主要遵循 [unikernel](https://en.wikipedia.org/wiki/Unikernel) 设计思想，由[矽望社区](https://www.syswonder.org/#/)维护。

考虑到边缘泛在计算场景下，应用通常数目有限且相对固定，因此将操作系统简化设计为只支持单应用，将内核功能封装为库，以系统调用的形式提供给应用，应用直接运行在内核态。

这种库形态的操作系统应用性能会有极大提升，安全问题(security)主要交给底层的 Type 1 hypervisor([hvisor](https://github.com/syswonder/hvisor)) 解决。库形态的操作系统需要良好的工具支持，以方便用户根据单一应用生成构造可运行的二进制镜像，如 [unikraft](https://unikraft.org/)。

如意 RuxOS 是一体内核操作系统，部分基础构件来自 ArceOS，RuxOS 完善了内核构件框架并补充添加各种模块，用以适配不同的应用场景，特别是对 Linux 应用的支持。RuxOS 使用 Rust 语言进行开发，充分利用 Rust 语言自身的安全特性，方便的构建工具以及快速发展的扩展库。为便于应用部署，RuxOS 提供了一个方便易用的应用镜像构建工具 [RuxGo](https://ruxgo.syswonder.org)。

RuxOS 仍然处于开发阶段，目前已完成了对诸多主流应用和编程语言的支持。

# RuxOS 手册结构

[第一部分](./chap01/Overview.md) 对 RuxOS 目前支持的 Feature，以及应用和编程语言支持情况进行简要介绍。

[第二部分](./chap02/getstarted.md) 对如何使用 RuxOS 运行现有示例进行了详细介绍。

[第三部分](./chap06/design_overview.md) 对 RuxOS 的内核模块、用户库实现中的关键技术进行了详细介绍。

[第四部分](./Contributors.md) 包含了 RuxOS 的所有开发贡献者。

