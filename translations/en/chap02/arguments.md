
# Compilation Parameter Explanation

RuxOS provides a set of compilation parameters that may seem intricate but offer flexibility and clarity for building and running various types of applications.

**General Options:**

| Option | Description |
| --- | --- |
| ARCH | Target architecture: x86_64, riscv64, aarch64. Default is x86_64. |
| PLATFORM | Target platform defined in the `platforms` directory. This parameter can be user-defined or generated based on the `ARCH` parameter, containing platform-specific parameter definitions. |
| SMP | Number of CPU cores. If greater than 1, it enables multi-core features. Default is 1. |
| MODE | Mode related to `cargo build`, default is release. |
| LOG | Log level: warn, error, info, debug, trace. Default is warn. |
| V | Verbose level: (empty), 1, 2 |
| ARGS | Command line arguments, comma-separated, no spaces, can be empty. Used to pass specific parameters to applications, i.e., `argc`, `argv`. |
| ENVS | Environment variable parameters, comma-separated, no spaces, can be empty. |

**Application Options:**

| Option | Description |
| --- | --- |
| A/APP | Path to the application directory. Supports relative and absolute paths. Default points to `apps/c/helloworld.` |
| FEATURES | Features of RuxOS modules. Used to enable additional features desired by the user without needing to appear in the specific application's `features.txt` file. |
| APP_FEATURES | Additional features for Rust applications. |

**Qemu Options:**

| Option | Description |
|---|---|
| BLK | Enable qemu virtio-blk backend. Set if the application requires persistent data or passing configuration files through the file system. |
| NET | Enable qemu virtio-net backend. Set if the application requires network usage. |
| GRAPHIC | Enable qemu virtio-gpu backend for graphical output. |
| BUS | Select device bus type: mmio, pci. |
| DISK_IMG | Path to the file system disk image. Default is `disk.img` in the root directory. |
| ACCEL | Enable x86 KVM hardware acceleration. |
| QEMU_LOG | Enable qemu logs, default output to `qemu.log` file, containing executed assembly code. |
| NET_DUMP | Network packet capture, output to `netdump.pcap` file in the root directory. |
| NET_DEV | Qemu network device type: user, tap. |

**9P Options:**

| Option | Description |
|---|---|
| V9P_PATH | File directory on the host for sharing. Default is the root directory. |
| NET_9P_ADDR| Address and port for 9p netdev. Default is `127.0.0.1:564`. |
| ANAME_9P | Path for 9pfs. |
| PROTOCOL_9P | 9p protocol type. |

**Network Options**, default port is 5555:

| Option | Description |
|---|---|
| IP | RuxOS IPv4 address (qemu user netdev, default is 10.0.2.15). |
| GW | Gateway IPv4 address (qemu user netdev, default is 10.0.2.2). |

**Libc Options:**

| Option | Description |
|---|---|
| MUSL | Use musl libc for compilation and linking. By default, RuxOS uses `ruxlibc`. Users can enable musl libc by setting `MUSL=y`. |

