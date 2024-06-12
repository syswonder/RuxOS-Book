
# 各类驱动

RuxOS 目前运行在虚拟机环境中，因此主要通过 VirtIO 来支持相关的设备驱动，实现了对应的前端接口。

### driver_common

定义了设备驱动的基本 trait、类型、错误类型：

基本特征，要求所有的设备驱动都必须实现：

```rust
/// Common operations that require all device drivers to implement.
#[const_trait]
pub trait BaseDriverOps: Send + Sync {
    /// The name of the device.
    fn device_name(&self) -> &str;

    /// The type of the device.
    fn device_type(&self) -> DeviceType;
}
```

支持的设备类型：

```rust
/// All supported device types.
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum DeviceType {
    /// Block storage device (e.g., disk).
    Block,
    /// Character device (e.g., serial port).
    Char,
    /// Network device (e.g., ethernet card).
    Net,
    /// Graphic display device (e.g., GPU)
    Display,
    /// Plan-9 device (e.g. 9pfs)
    _9P,
}
```

设备错误类型：

```rust
/// The error type for device operation failures.
#[derive(Debug)]
pub enum DevError {
    /// An entity already exists.
    AlreadyExists,
    /// Try again, for non-blocking APIs.
    Again,
    /// Bad internal state.
    BadState,
    /// Invalid parameter/argument.
    InvalidParam,
    /// Input/output error.
    Io,
    /// Not enough space/cannot allocate memory (DMA).
    NoMemory,
    /// Device or resource is busy.
    ResourceBusy,
    /// This operation is unsupported or unimplemented.
    Unsupported,
}
```

### driver_block

提供了树莓派4B的SD卡bcm2835_sdhci驱动以及基于内存的磁盘驱动。

定义了块设备的基本操作 trait：

```rust
/// Operations that require a block storage device driver to implement.
pub trait BlockDriverOps: BaseDriverOps {
    /// The number of blocks in this storage device.
    ///
    /// The total size of the device is `num_blocks() * block_size()`.
    fn num_blocks(&self) -> u64;
    /// The size of each block in bytes.
    fn block_size(&self) -> usize;

    /// Reads blocked data from the given block.
    ///
    /// The size of the buffer may exceed the block size, in which case multiple
    /// contiguous blocks will be read.
    fn read_block(&mut self, block_id: u64, buf: &mut [u8]) -> DevResult;

    /// Writes blocked data to the given block.
    ///
    /// The size of the buffer may exceed the block size, in which case multiple
    /// contiguous blocks will be written.
    fn write_block(&mut self, block_id: u64, buf: &[u8]) -> DevResult;

    /// Flushes the device to write all pending data to the storage.
    fn flush(&mut self) -> DevResult;
}
```

定义了两个数据结构：

- SDHCIDriver：树莓派4B的SD卡驱动，实现了上面的块设备基本 trait 以及设备驱动基本 [trait](#driver_common)，借助了第三方库[bcm2835-sdhci](https://github.com/syswonder/bcm2835-sdhci.git)。

- RamDisk：基于内存的磁盘类型，以 Rust 的 Vector 类型来保存具体的数据到内存中，实现了上述两种 trait。

### driver_net

实现了 ixbge 网卡驱动，定义了网卡驱动的基本 trait：

```rust
pub trait NetDriverOps: BaseDriverOps {
    /// The ethernet address of the NIC.
    fn mac_address(&self) -> EthernetAddress;

    /// Whether can transmit packets.
    fn can_transmit(&self) -> bool;

    /// Whether can receive packets.
    fn can_receive(&self) -> bool;

    /// Size of the receive queue.
    fn rx_queue_size(&self) -> usize;

    /// Size of the transmit queue.
    fn tx_queue_size(&self) -> usize;

    /// Gives back the `rx_buf` to the receive queue for later receiving.
    ///
    /// `rx_buf` should be the same as the one returned by
    /// [`NetDriverOps::receive`].
    fn recycle_rx_buffer(&mut self, rx_buf: NetBufPtr) -> DevResult;

    /// Poll the transmit queue and gives back the buffers for previous transmiting.
    /// returns [`DevResult`].
    fn recycle_tx_buffers(&mut self) -> DevResult;

    /// Transmits a packet in the buffer to the network, without blocking,
    /// returns [`DevResult`].
    fn transmit(&mut self, tx_buf: NetBufPtr) -> DevResult;

    /// Receives a packet from the network and store it in the [`NetBuf`],
    /// returns the buffer.
    ///
    /// Before receiving, the driver should have already populated some buffers
    /// in the receive queue by [`NetDriverOps::recycle_rx_buffer`].
    ///
    /// If currently no incomming packets, returns an error with type
    /// [`DevError::Again`].
    fn receive(&mut self) -> DevResult<NetBufPtr>;

    /// Allocate a memory buffer of a specified size for network transmission,
    /// returns [`DevResult`]
    fn alloc_tx_buffer(&mut self, size: usize) -> DevResult<NetBufPtr>;
}
```

### driver_display

定义了图像设备驱动的基本 trait：

```rust
/// Operations that require a graphics device driver to implement.
pub trait DisplayDriverOps: BaseDriverOps {
    /// Get the display information.
    fn info(&self) -> DisplayInfo;

    /// Get the framebuffer.
    fn fb(&self) -> FrameBuffer;

    /// Whether need to flush the framebuffer to the screen.
    fn need_flush(&self) -> bool;

    /// Flush framebuffer to the screen.
    fn flush(&mut self) -> DevResult;
}
```


### driver_pci

定义了 PCI 总线相关的数据结构和操作函数。

### driver_9p

定义了 9P 设备的基本操作 trait：

```rust
/// Operations that require a 9p driver to implement.
pub trait _9pDriverOps: BaseDriverOps {
    /// initialize self(e.g. setup TCP connection)
    fn init(&self) -> Result<(), u8>;

    /// send bytes of inputs as request and receive  get answer in outputs
    fn send_with_recv(&mut self, inputs: &[u8], outputs: &mut [u8]) -> Result<u32, u8>; // Ok(length)/Err()
}
```

### driver_virtio

基于上述组件中定义的各种设备类型的基本 trait，结合 Rust 第三方库 [`virtio-drivers`](https://github.com/syswonder/virtio-drivers.git)，在 driver_virtio 这一底层组件中实现了具体的 VirtIO 设备接口。提供如下设备：

- VirtIoBlkDev：块设备，封装了`virtio_drivers::device::blk::VirtIOBlk`。

- VirtIoNetDev：网卡设备，封装了`virtio_drivers::device::net::VirtIONetRaw`。

- VirtIoGpuDev：GPU 设备，封装了`virtio_drivers::device::gpu::VirtIOGpu`。

- VirtIo9pDev：9p 设备，封装了`virtio_drivers::{device::v9p::VirtIO9p`。



