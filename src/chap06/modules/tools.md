
# 调试及开发工具

为了方便调试和开发，在 RuxOS 功能模块中实现了相关的工具：

- [axlog](#日志调试工具-axlog)：基于等级的日志打印工具。

- [axsync](#同步工具-axsync)：提供编程用的锁语义。

- [ruxfutex](#快速用户态锁-ruxfutex)：兼容 Linux 的快速用户态锁。

### 日志调试工具 axlog

RuxOS 基于第三方库 log 封装了 axlog，提供了不同的日志等级，方便内核开发者调试。

日志等级从高到低分别为：error、warn、info、debug、trace。使用方法如下：

```rust
// Examples
use axlog::{debug, error, info, trace, warn};

// Initialize the logger.
axlog::init();
// Set the maximum log level to `info`.
axlog::set_max_level("info");

// The following logs will be printed.
error!("error");
warn!("warn");
info!("info");

// The following logs will not be printed.
debug!("debug");
trace!("trace");
```

### 同步工具 axsync

在内核开发中，往往涉及到多任务间的同步，在 axsync 中，基于 spinlock 组件实现了开发工具 axsync，提供 Mutex 数据结构，基于 CAS 指令和 WaitQuquq 实现。

### 快速用户态锁 ruxfutex

Linux 提供了快速用户态锁 futex，让应用程序能够快速对锁进行检查，而不需要每次都进入内核。借助 futex 的实现，进一步封装为了 pthread_mutex、semaphore 的相关语义。基于 Linux 的 futex，RuxOS 实现了 ruxfutex，用于匹配 futex 相关的系统调用。

ruxfutex 基于 WaitQueue 来实现，根据不同的 FutexKey，将不同的任务阻塞在不同的 bucket 中，其中 FutexKey 包含了某一变量地址、该地址上期望的变量值。支持了 futex_wait、futex_wake 语义。

