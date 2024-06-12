# RuxOS Book 结构

[简介](./Introduction.md)

# 关于 RuxOS

- [RuxOS 概述](./chap01/Overview.md)

# RuxOS 使用手册

- [运行现有应用](./chap02/getstarted.md)

    - [环境配置说明](./chap02/env-config.md)

    - [编译参数及常用命令说明](./chap02/arguments.md)

    - [现有应用及编程语言支持](./chap02/apps/root.md)

        - [Hello World!](./chap02/apps/helloworld.md)

        - [Iperf3](./chap02/apps/iperf.md)

        - [SQLite](./chap02/apps/sqlite.md)

        - [Redis](./chap02/apps/redis.md)

        - [Nginx](./chap02/apps/nginx.md)

        - [Wamr](./chap02/apps/wamr.md)

        - [Perl](./chap02/apps/perl.md)
    
    - [动态加载应用ELF文件](./chap02/ELF-loader.md)

- [自定义应用](./chap03/your_app.md)

- [使用 ruxgo 构建](./chap04/ruxgo.md)

- [多平台支持](./chap05/multiplatforms.md)

    - [Raspi4](./chap05/Raspi4.md)

# 整体架构

- [设计概述](./chap06/design_overview.md)

    - [底层组件](./chap06/crates/crates.md)

        - [各类驱动](./chap06/crates/drivers.md)

        - [内核数据结构](./chap06/crates/kernel-tools.md)

        - [内存分配及调度算法](./chap06/crates/algorithms.md)

        - [架构相关](./chap06/crates/arch-related.md)

        - [文件系统及 IO 类](./chap06/crates/fs-IO.md)

        - [页表项及页表](./chap06/crates/pte-pt.md)

        - [percpu类](./chap06/crates/percpu.md)

    - [功能模块](./chap06/modules/modules.md)

        - [配置及运行时初始化](./chap06/modules/config-and-initialization.md)

        - [调试及开发工具](./chap06/modules/tools.md)

        - [内核子模块](./chap06/modules/kernel-submodules.md)

        - [9pfs](./chap06/modules/9pfs.md)

- [用户库](./chap07/ulib/ulib.md)

    - [ruxos-posix-api](./chap07/ulib/ruxos-posix-api.md)

    - [ruxlibc](./chap07/ulib/ruxlibc.md)

    - [ruxmusl](./chap07/ulib/ruxmusl.md)


# 未来工作

- [TODO]()

---
[贡献者](./Contributors.md)
