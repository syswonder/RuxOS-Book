
# percpu 类、宏

RuxOS 在链接脚本中预留了 per-CPU 相关数据的内存空间，有专门的架构相关的寄存器指向对应位置，X64中使用`GS_BASE`，A64中使用`TPIDR_EL1`，Rv64中由于没有相应的专用寄存器，因此暂时使用了`GP`寄存器。

使用方法如下所示：

```rust
#[percpu::def_percpu]
static CPU_ID: usize = 0;

// initialize per-CPU data for 4 CPUs.
percpu::init(4);
// set the thread pointer register to the per-CPU data area 0.
percpu::set_local_thread_pointer(0);

// access the per-CPU data `CPU_ID` on the current CPU.
println!("{}", CPU_ID.read_current()); // prints "0"
CPU_ID.write_current(1);
println!("{}", CPU_ID.read_current()); // prints "1"
```

`#[percpu::def_percpu]` 提供了便捷的宏定义，将指定的静态变量定义为 per-CPU 数据类型。

