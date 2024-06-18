
# 内存分配及调度算法

RuxOS 底层组件实现了多种内存分配和任务调度算法，提供给用户灵活的选择，针对不同类型的应用进行特殊优化。

## 内存分配算法

RuxOS 支持三种内存分配算法，提供给应用使用。在内存分配组件中，定义了如下特征：

```rust
/// The base allocator inherited by other allocators.
pub trait BaseAllocator {
    /// Initialize the allocator with a free memory region.
    fn init(&mut self, start: usize, size: usize);

    /// Add a free memory region to the allocator.
    fn add_memory(&mut self, start: usize, size: usize) -> AllocResult;
}
```

`BaseAllocator` 定义了作为分配器的基本方法，即初始化可用内存范围，以及扩大可用内存范围。

```rust
/// Byte-granularity allocator.
pub trait ByteAllocator: BaseAllocator {
    /// Allocate memory with the given size (in bytes) and alignment.
    fn alloc(&mut self, layout: Layout) -> AllocResult<NonNull<u8>>;

    /// Deallocate memory at the given position, size, and alignment.
    fn dealloc(&mut self, pos: NonNull<u8>, layout: Layout);

    /// Returns total memory size in bytes.
    fn total_bytes(&self) -> usize;

    /// Returns allocated memory size in bytes.
    fn used_bytes(&self) -> usize;

    /// Returns available memory size in bytes.
    fn available_bytes(&self) -> usize;
}
```

`ByteAllocator` 定义了以字节为粒度的分配器所具备的基本方法，包括：

- 分配/释放指定大小的内存，以 rust 的 `layout` 进行描述。

- 目前管理的内存信息，包括总字节数、已用字节数、可用字节数。


```rust
/// Page-granularity allocator.
pub trait PageAllocator: BaseAllocator {
    /// The size of a memory page.
    const PAGE_SIZE: usize;

    /// Allocate contiguous memory pages with given count and alignment.
    fn alloc_pages(&mut self, num_pages: usize, align_pow2: usize) -> AllocResult<usize>;

    /// Deallocate contiguous memory pages with given position and count.
    fn dealloc_pages(&mut self, pos: usize, num_pages: usize);

    /// Returns the total number of memory pages.
    fn total_pages(&self) -> usize;

    /// Returns the number of allocated memory pages.
    fn used_pages(&self) -> usize;

    /// Returns the number of available memory pages.
    fn available_pages(&self) -> usize;
}
```

`PageAllocator` 定义了以页为粒度的分配器的基本方法，与字节为粒度的分配器方法类似。


### buddy 算法

[Buddy](https://en.wikipedia.org/wiki/Buddy_memory_allocation) 算法将内存分为多个固定大小的块，分配的时候仅分配出去最接近需求大小的内存块。

RuxOS 借助第三方库 [buddy_system_allocator](https://crates.io/crates/buddy_system_allocator) 来进行实现，提供了 `BuddyByteAllocator` 结构体，为其实现了 `BaseAllocator` 和 `ByteAllocator` 两个 trait，基于 `buddy` feature 进行条件编译。


### slab 算法

[Slab](https://en.wikipedia.org/wiki/Slab_allocation) 分配器以从64到4096的2的幂次方大小的对象为粒度自主进行内存分配，对大于4096字节的内存块借助 `buddy_system` 分配器进行分配。

RuxOS 自己实现了相关的 slab 算法分配语义，提供了 `SlabByteAllocator` 结构体，为其实现了 `BaseAllocator` 和 `ByteAllocator` 两个 trait，基于 `slab` feature 进行条件编译。

### tlsf 算法

[tlsf](http://www.gii.upv.es/tlsf/) 动态内存分配算法常用于实时系统中，借助第三方库 [rlsf](https://crates.io/crates/rlsf) 来进行实现，提供了 TlsfByteAllocator 结构体，为其实现了 `BaseAllocator` 和 `ByteAllocator` 两个 trait，基于 `tlsf` feature 进行条件编译。

## 任务调度算法

RuxOS 支持三种任务调度算法，定义了调度器的基本特征：

```rust
/// The base scheduler trait that all schedulers should implement.
///
/// All tasks in the scheduler are considered runnable. If a task is go to
/// sleep, it should be removed from the scheduler.
pub trait BaseScheduler {
    /// Type of scheduled entities. Often a task struct.
    type SchedItem;

    /// Initializes the scheduler.
    fn init(&mut self);

    /// Adds a task to the scheduler.
    fn add_task(&mut self, task: Self::SchedItem);

    /// Removes a task by its reference from the scheduler. Returns the owned
    /// removed task with ownership if it exists.
    ///
    /// # Safety
    ///
    /// The caller should ensure that the task is in the scheduler, otherwise
    /// the behavior is undefined.
    fn remove_task(&mut self, task: &Self::SchedItem) -> Option<Self::SchedItem>;

    /// Picks the next task to run, it will be removed from the scheduler.
    /// Returns [`None`] if there is not runnable task.
    fn pick_next_task(&mut self) -> Option<Self::SchedItem>;

    /// Puts the previous task back to the scheduler. The previous task is
    /// usually placed at the end of the ready queue, making it less likely
    /// to be re-scheduled.
    ///
    /// `preempt` indicates whether the previous task is preempted by the next
    /// task. In this case, the previous task may be placed at the front of the
    /// ready queue.
    fn put_prev_task(&mut self, prev: Self::SchedItem, preempt: bool);

    /// Advances the scheduler state at each timer tick. Returns `true` if
    /// re-scheduling is required.
    ///
    /// `current` is the current running task.
    fn task_tick(&mut self, current: &Self::SchedItem) -> bool;

    /// set priority for a task
    fn set_priority(&mut self, task: &Self::SchedItem, prio: isize) -> bool;
}
```

在 `BaseScheduler` 中定义了调度器的关联对象类型和基本方法：

- `SchedItem`：定义了调度器的调度对象，包含其属性等，与具体的调度算法有关。

- `init`：调度器初始化。

- `add_task/remove_task`：放入就绪的任务或移除任务。

- `pick_next_task`：获取下一个可运行的任务。

- `put_prev_task`：将上一个任务重新放回调度器中，如果该任务是被抢占的任务，则放入就绪队列的头部，否则放入末尾。

- `task_tick`：递增相关的时钟属性。

- `set_priority`：设置任务的优先级。


### FIFO 算法

FIFO 先入先出算法按序执行当前就绪队列中的所有任务，以先到达的任务先占据CPU为原则，直到该任务运行完成主动退出，或主动让出处理器，才会调度下一个就绪任务。由于该算法在当前的多种编程语言和主流应用中不适用，RuxOS 正在考虑移除该算法实现。

RuxOS 提供了 `FifoScheduler` 对象，为其实现了 `BaseScheduler`。

### RR 算法

[Round Robin](https://en.wikipedia.org/wiki/Round-robin_scheduling) 时间片轮转算法以时间片为单位进行任务调度，当时钟中断来临时，对当前正在执行的任务进行换出，调度下一个等待的就绪任务。

RuxOS 提供了 `RRScheduler` 对象，为其实现了 `BaseScheduler`。

### CFS 算法

[Completely Fair Scheduler](https://en.wikipedia.org/wiki/Completely_Fair_Scheduler) 完全公平调度算法基于 nice 值来对任务进行调度，期望任务根据优先级来按比例获取处理器时间。

RuxOS 提供了 `CFScheduler` 对象，为其实现了 `BaseScheduler`。
