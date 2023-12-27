# 9pfs

In this section, there is a brief introduction to the 9p protocol and a concise explanation of how to use 9pfs on RuxOS.

9PFS, or 9p-filesystem, is a file system implementation based on the 9P protocol for reading and writing files on the server side.

In RuxOS, 9pfs corresponds to two different features, namely `virtio-9p` and `net-9p`. `virtio-9p` uses the `virtio-9p` virtual device in the hypervisor for communication to control host file system read and write operations. On the other hand, `net-9p` uses the TCP protocol over the network for connection and communication to control read and write operations on the server-side file system. Both of these features can be enabled simultaneously and work correctly.

9P is essentially a communication protocol for file reading and writing, operating at the session layer. This means that 9P is independent of the physical layer, data link layer, and so on. The protocol has three versions: `9P2000`, `9P2000.L`, and `9P2000.u`. Details of the protocol can be found in the following links:

* [Basic Protocol of 9P2000](https://ericvh.github.io/9p-rfc/rfc9p2000.html)
* [Extended Protocol Version 9P2000.L](https://github.com/chaos/diod/blob/master/protocol.md)
* [Extended Protocol Version 9P2000.u](http://ericvh.github.io/9p-rfc/rfc9p2000.u.html)

## virtio-9p

To use `virtio-9p`, you need to add this feature to the APP.

For C APP, add the following line to the features.txt file in the APP directory:

```txt
virtio-9p
```

For Rust APP, you need to add the `virtio-9p` feature to the `axstd` feature in the Cargo.toml file in the APP directory. For example, in the Cargo.toml of `application/fs/shell`:

```txt
axstd = { path = "../../../ulib/axstd", features = ["alloc", "fs", "virtio-9p"], optional = true }
```

Next, to enable the virtio-9p backend on the host (currently qemu-system-aarch64), you need to add the `V9P=y` parameter to the `make` command line.

For example:

```shell
make A=xxxx LOG=error V9P=y V9P_PATH=xxxx ARCH=xxxx
```

`V9P_PATH` is an **environment variable** corresponding to the path of the host file directory mapping. If this parameter is not set, it defaults to the current directory `./`.

Following these steps, theoretically, a `v9fs` directory will be created in the root directory (or loaded as the root file system), and this directory should contain the file directory mapped by the host backend. For example, when `V9P_PATH=./temp/`, the v9fs (or root file) directory will be consistent with the `./temp` directory.

Additionally, virtio-9p involves some configurable environment variables. These environment variables have default values, and sometimes they do not need to be explicitly set. The environment variables and their default values are:

```makefile
V9P_PATH ?= ./           # Path to the host file directory mapping, default is the current directory
ANAME_9P ?= ./           # Path parameter of aname during tattach, in the current version of qemu, it can be set to any value, but in some cases (multiple mapped paths on the host), it may need to be set to the selected corresponding host file directory path
PROTOCOL_9P ?= 9P2000.L  # Default selected 9P protocol, such as `9P2000.L` and `9P2000.u`, case-sensitive
```

## net-9p

To use `net-9p`, you need to add this feature to the APP.

For C APP, add the following line to the features.txt file in the APP directory:

```txt
net-9p
```

For Rust APP, you need to add the `net-9p` feature to the `axstd` feature in the Cargo.toml file in the APP directory. For example, in the Cargo.toml of `application/fs/shell`:

```txt
axstd = { path = "../../../ulib/axstd", features = ["alloc", "fs", "net-9p"], optional = true }
```

Next, `net-9p` needs to communicate through the TCP network protocol, so you need to add the `NET=y` parameter to the `make` command line.

For example:

```shell
make A=xxxx LOG=error NET=y ARCH=xxxx
```

Following these steps, theoretically, a `v9fs` directory will be created in the root directory (or loaded as the root file system), and this directory should contain the file directory mapped by the host backend. The specific path mapped by the `net-9p` backend may need to be controlled through `ANAME_9P`, depending on the design of the server-side (or it may be set as a parameter when starting the server or by changing part of the server-side code).

Additionally, `net-9p` involves some configurable environment variables. These environment variables have default values, and sometimes they do not need to be explicitly set. The environment variables and their default values are:

```makefile
NET_9P_ADDR ?= 127.0.0.1:564 # IP address and port number of the 9P server, default is 127.0.0.1:564.
ANAME_9P ?= ./           # Path parameter of aname during tattach, it may need to be set to the selected corresponding host file directory path
PROTOCOL_9P ?= 9P2000.L  # Default selected 9P protocol, such as `9P2000.L` and `9P2000.u`, case-sensitive
```
