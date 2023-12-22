
# 欢迎使用 RuxOS！

该项目为 RuxOS 手册，面向应用开发者和内核开发者，包含以下内容：

* RuxOS 概述

* 使用 RuxOS 运行应用

* RuxOS 整体设计

RuxOS 手册仍在完善中。

# RuxOS 是什么？

RuxOS 是一个兼容 Linux 应用的轻量化库操作系统，主要遵循 [unikernel](https://en.wikipedia.org/wiki/Unikernel) 设计思想，由[矽望社区](https://www.syswonder.org/#/)维护。

考虑到边缘泛在计算场景下，应用通常数目有限且相对固定，因此将操作系统简化设计为只支持单应用，将内核功能封装为库，以系统调用的形式提供给应用，应用直接运行在内核态。

这种库形态的操作系统应用性能会有极大提升，安全问题(security)主要交给底层的 Type 1 hypervisor([hvisor](https://github.com/syswonder/hvisor)) 解决。库形态的操作系统需要良好的工具支持，以方便用户根据单一应用生成构造可运行的二进制镜像，如 [unikraft](https://unikraft.org/)。

RuxOS 仍然处于开发阶段，目前已完成了对部分主流应用的支持。
