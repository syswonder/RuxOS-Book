# Raspi4
移植Ruxos到树莓派上与移植Arceos到树莓派上的流大体上一致，只是有些细节不同。本文还包括了一些可能出现的问题以及解决方案。（可参考文章[https://report.syswonder.org/#/2023/20230601_Raspi4-debug-with-jtag](https://report.syswonder.org/#/2023/20230601_Raspi4-debug-with-jtag)）

所需要的硬件：
- 树莓派以及SD卡

- usb转串口模块

- JTAG调试器（debug需要用到，只是运行则不需要），调试部分可参考上面提到的文章。

#### 步骤一：烧录好SD卡
给 sd 卡分一个 FAT32 的 boot 区，然后放入启动所需要的文件:

- 下载以下三个文件：`bcm2711-rpi-4-b.dtb`，`start4.elf`，`fixup4.dat`。下载地址：[https://github.com/raspberrypi/firmware/tree/master/boot](https://github.com/raspberrypi/firmware/tree/master/boot)

- 基本启动镜像`kernel8.img`。首先clone `rust-raspberrypi-OS-tutorials`（ [https://github.com/rust-embedded/rust-raspberrypi-OS-tutorials](https://github.com/rust-embedded/rust-raspberrypi-OS-tutorials)）到本地，然后进入`06_uart_chainloader`文件夹，运行`make BSP=rpi4` 即可在文件夹内生成一个`kernel8.img`。

- 配置文件`config.txt`,该配置文件是用于正确设置启动选项，内容为：

```bash
arm_64bit=1
init_uart_clock=48000000
enable_jtag_gpio=1
device_tree_address=0x03000000

```
#### 步骤二：串口模块连接上树莓派，并运行

- 按照以下图片接线:
 ![serial-connect](img/serial-connect.jpg)

- 进入Ruxos目录，运行命令：`make ARCH=aarch64 PLATFORM=aarch64-raspi4 chainboot`

- 如果正常则终端会输出：
```bash
Minipush 1.0

[MP] ✅ Serial connected
[MP] 🔌 Please power the target now

```

- 此时给树莓派上电，结果如下：
```shell
 __  __ _      _ _                 _
|  \/  (_)_ _ (_) |   ___  __ _ __| |
| |\/| | | ' \| | |__/ _ \/ _` / _` |
|_|  |_|_|_||_|_|____\___/\__,_\__,_|

           Raspberry Pi 4            

[ML] Requesting binary
[MP] ⏩ Pushing 64 KiB =========================================🦀 100% 0 KiB/s Time: 00:00:00
[ML] Loaded! Executing the payload now

8888888b.                     .d88888b.   .d8888b.  
888   Y88b                   d88P" "Y88b d88P  Y88b 
888    888                   888     888 Y88b.      
888   d88P 888  888 888  888 888     888  "Y888b.   
8888888P"  888  888 `Y8bd8P' 888     888     "Y88b. 
888 T88b   888  888   X88K   888     888       "888 
888  T88b  Y88b 888 .d8""8b. Y88b. .d88P Y88b  d88P 
888   T88b  "Y88888 888  888  "Y88888P"   "Y8888P" 

arch = aarch64
platform = aarch64-raspi4
target = aarch64-unknown-none-softfloat
smp = 1
build_mode = release
log_level = warn

Hello, C app!
```
#### 步骤三：运行Ruxos并使用SD卡驱动：

- 进入Ruxos目录下，运行命令：`make ARCH=aarch64 PLATFORM=aarch64-raspi4 A=apps/fs/shell FEATURES=driver-bcm2835-sdhci chainboot`

- 和步骤二类似，再看到开机提示后给树莓派上电，结果如下：

```shell
Minipush 1.0

[MP] ✅ Serial connected
[MP] 🔌 Please power the target now

 __  __ _      _ _                 _
|  \/  (_)_ _ (_) |   ___  __ _ __| |
| |\/| | | ' \| | |__/ _ \/ _` / _` |
|_|  |_|_|_||_|_|____\___/\__,_\__,_|

           Raspberry Pi 4            

[ML] Requesting binary
[MP] ⏩ Pushing 256 KiB ======================================🦀 100% 128 KiB/s Time: 00:00:02
[ML] Loaded! Executing the payload now

8888888b.                     .d88888b.   .d8888b.  
888   Y88b                   d88P" "Y88b d88P  Y88b 
888    888                   888     888 Y88b.      
888   d88P 888  888 888  888 888     888  "Y888b.   
8888888P"  888  888 `Y8bd8P' 888     888     "Y88b. 
888 T88b   888  888   X88K   888     888       "888 
888  T88b  Y88b 888 .d8""8b. Y88b. .d88P Y88b  d88P 
888   T88b  "Y88888 888  888  "Y88888P"   "Y8888P" 

arch = aarch64
platform = aarch64-raspi4
target = aarch64-unknown-none-softfloat
smp = 1
build_mode = release
log_level = warn

Available commands:
  cat
  cd
  echo
  exit
  help
  ls
  mkdir
  pwd
  rm
  uname
ruxos:/$ ls
drwxr-xr-x      512 .Trash-1000
drwxr-xr-x      512 System Volume Information
-rwxr-xr-x    52593 bcm2711-rpi-4-b.dtb
-rwxr-xr-x       86 config.txt
drwxr-xr-x     4096 dev
drwxr-xr-x     4096 etc
-rwxr-xr-x     5397 fixup4.dat
drwxr-xr-x      512 hello
-rwxr-xr-x     8688 kernel8.img
drwxr-xr-x     4096 proc
-rwxr-xr-x  2251488 start4.elf
drwxr-xr-x     4096 sys
drwxr-xr-x     4096 tmp
ruxos:/$ 
```

#### 可能出现的问题：

##### 串口设备异常：

串口设备设置不正确时会一直卡在：
```bash
Minipush 1.0

[MP] ⏳ Waiting for /dev/ttyUSB0
```
- 在linux系统里可以通过`ls /dev`来显示所有外设，可以观察插上usb转ttl模块后，是否有名为ttyUSB0的设备（这是默认usb设备名称，也是后续我们写死在makefile里的名称）。如果没有该设备，可能是驱动没安装上。可以参考该文章来安装驱动 [https://blog.csdn.net/weixin_43790050/article/details/131362540](https://blog.csdn.net/weixin_43790050/article/details/131362540)

- 如果想要验证串口设备是否正常，可以将TX和RX连接上，然后发送信息。如果串口设备是正常的，则每发送一条信息就会收到一条同样的信息

##### SD卡驱动的问题：

Ruxos现在实现了解析设备树，但是与qemu不同，树莓派不会将dtb文件的指针放在某个寄存器上，于是只能通过相关设置，来固定dtb文件的位置。在`config.txt`中`device_tree_address=0x03000000`指定了dtb文件的物理地址。在`modules/ruxhal/src/platform/aarch64_raspi/mod.rs`中，修改`rust_entry`函数，即启动时默认从`0x03000000`地址来初始化设备树。

```rust
pub(crate) unsafe extern "C" fn rust_entry(cpu_id: usize) {
    crate::mem::clear_bss();
    crate::arch::set_exception_vector_base(exception_vector_base as usize);
    crate::arch::write_page_table_root0(0.into()); // disable low address access
    //Set the physical address of the dtb file to 0x03000000 in config.txt
    unsafe {
        dtb::init(crate::mem::phys_to_virt(0x03000000.into()).as_ptr());
    }
    crate::cpu::init_primary(cpu_id);
    super::aarch64_common::pl011::init_early();
    super::aarch64_common::generic_timer::init_early();
    rust_main(cpu_id, 0x03000000);
}
```

##### docker报错 var/run/docker.sock 权限不够:

运行以下两行命令即可

```bash
cd /
sudo chmod 666 var/run/docker.sock
```
