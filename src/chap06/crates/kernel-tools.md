
# 内核数据结构

RuxOS 底层组件提供了多种用于操作系统中重要数据结构实现的工具，移植于 ArceOS。

### capability

提供[基于访问权限的安全控制](https://en.wikipedia.org/wiki/Capability-based_security)数据结构 `WithCap`，使用方法如下：

```rust
use capability::{Cap, WithCap};

let data = WithCap::new(42, Cap::READ | Cap::WRITE);

// Access with the correct capability.
assert_eq!(data.access(Cap::READ).unwrap(), &42);
assert_eq!(data.access(Cap::WRITE).unwrap(), &42);
assert_eq!(data.access(Cap::READ | Cap::WRITE).unwrap(), &42);

// Access with the incorrect capability.
assert!(data.access(Cap::EXECUTE).is_err());
assert!(data.access(Cap::READ | Cap::EXECUTE).is_err());
```

### flatten objects

借助位图实现的扁平化的指定大小容器，提供O(1)时间复杂度的访问方法，在 RuxOS 中用于文件描述符表的实现，使用方法如下：

```rust
use flatten_objects::FlattenObjects;

let mut objects = FlattenObjects::<u32, 20>::new();

// Add `23` 10 times and assign them IDs from 0 to 9.
for i in 0..=9 {
    objects.add_at(i, 23).unwrap();
    assert!(objects.is_assigned(i));
}

// Remove the object with ID 6.
assert_eq!(objects.remove(6), Some(23));
assert!(!objects.is_assigned(6));

// Add `42` (the ID 6 is available now).
let id = objects.add(42).unwrap();
assert_eq!(id, 6);
assert!(objects.is_assigned(id));
assert_eq!(objects.get(id), Some(&42));
assert_eq!(objects.remove(id), Some(42));
assert!(!objects.is_assigned(id));
```

上述示例中，创建了一个大小为20的容器objects，保存u32类型的数据，通过`add/add_at`方法向容器中（指定位置）添加新的元素，通过`remove`方法来移除指定位置的数据，提供`get`方法获取指定位置数据的引用，提供`is_assigned`方法判断指定位置是否存在数据。

### lazy init

lazy_init 组件提供与 [lazy_static](https://docs.rs/lazy_static/latest/lazy_static/) 类似的语义，用于延迟初始化，将指定数据结构的初始化和过程的执行延迟到具体变量被访问时，使用方法如下：

```rust
use lazy_init::LazyInit;

static VALUE: LazyInit<u32> = LazyInit::new();
assert!(!VALUE.is_init());
// println!("{}", *VALUE); // panic: use uninitialized value
assert_eq!(VALUE.try_get(), None);

VALUE.init_by(233);
// VALUE.init_by(666); // panic: already initialized
assert!(VALUE.is_init());
assert_eq!(*VALUE, 233);
assert_eq!(VALUE.try_get(), Some(&233));
```

在上述示例中，借助`lazy_init`创建了VALUE这一静态变量，提供`init_by`方法进行初始化之后，通过`get/try_get`等方法来访问，通过解指针的方法获取数据。

### linked list

移植于 ArceOS，基于[Rust-for-Linux](https://github.com/Rust-for-Linux/linux/blob/rust/rust/kernel/linked_list.rs)的实现。

### ratio

提供整数相除的数据结构 `ratio`，保存了整除的分子和分母，使用方法如下：

```rust
use ratio::Ratio;

let ratio = Ratio::new(1, 3); // 1 / 3
assert_eq!(ratio.mul_trunc(20), 6); // trunc(20 * 1 / 3) = trunc(6.66..) = 6
assert_eq!(ratio.mul_round(20), 7); // round(20 * 1 / 3) = round(6.66..) = 7
println!("{:?}", ratio); // Ratio(1/3 ~= 1431655765/4294967296)
```

### spinlock

提供三种类型的[自旋锁](https://en.m.wikipedia.org/wiki/Spinlock)：

- **SpinNoPreempt**：禁止内核抢占的自旋锁，只能用于本地禁止 IRQ 的上下文，不允许用在中断处理过程中。

- **SpinNoIrq**：禁止内核抢占和本地 IRQ 的自旋锁，可以用在使能了 IRQ 的上下文中。

- **SpinRaw**：普通自旋锁，只能用于禁止内核抢占以及关闭了本地 IRQ 的上下文中，不允许用在中断处理过程中。


### timer list

用于注册一系列带时间戳的事件，超时触发，使用方法如下：

```rust
use timer_list::{TimerEvent, TimerEventFn, TimerList};
use std::time::{Duration, Instant};

let mut timer_list = TimerList::new();

// set a timer that will be triggered after 1 second
let start_time = Instant::now();
timer_list.set(Duration::from_secs(1), TimerEventFn::new(|now| {
    println!("timer event after {:?}", now);
}));

while !timer_list.is_empty() {
    // check if there is any event that is expired
    let now = Instant::now().duration_since(start_time);
    if let Some((deadline, event)) = timer_list.expire_one(now) {
        // trigger the event, will print "timer event after 1.00s"
        event.callback(now);
        break;
    }
   std::thread::sleep(Duration::from_millis(10)); // relax the CPU
}
```

上述示例中，定义了 `timer_list` 这一事件列表实例，并在其中注册了1秒后超时的一个打印时间，在通过不断的检查是否有事件超时，超时则取出，调用对应的闭包，否则进入睡眠。

### tuple for each

提供对 `tuple` 类型进行遍历的宏和方法。使用方法如下：

```rust
use tuple_for_each::TupleForEach;

#[derive(TupleForEach)]
struct FooBar(u32, &'static str, bool);

let tup = FooBar(23, "hello", true);
assert!(!tup.is_empty());
assert_eq!(tup.len(), 3);

// prints "23", "hello", "true" line by line
tuple_for_each!(x in tup {
    println!("{}", x);
});

// prints "0: 23", "1: hello", "2: true" line by line
tuple_enumerate!((i, x) in tup {
    println!("{}: {}", i, x);
});
```

在上述示例中，给 `FooBar` 结构体添加了 `TupleForEach` 的宏，进而能通过 `tuple_for_each` 和 `tuple_enumerate` 来进行遍历。

