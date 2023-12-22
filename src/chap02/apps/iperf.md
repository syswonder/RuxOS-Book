
# Iperf3

[iPerf3](https://github.com/esnet/iperf) 是一个用来测试网络实时带宽性能的工具.

## 构建、运行

通过下面的命令，在 RuxOS 上启动 iperf3 服务器：

```bash
# in ruxos root directory
make A=apps/c/iperf BLK=y NET=y ARCH=<arch> run
```

## 基准测试

打开另一个终端，运行 `iperf3` 的客户端：

* RuxOS-iperf3 作为接收端:

    ```bash
    # TCP
    iperf3 -c 127.0.0.1 -p 5555
    # UDP
    iperf3 -uc 127.0.0.1 -p 5555 -b <sender_bitrate> -l <buffer_len>
    ```

    用户需要设置 `<sender_bitrate>` 参数来避免在使用 UDP 的时候，从客户端发送的包过快。

* RuxOS-iperf3 作为发送端:

    ```bash
    # TCP
    iperf3 -c 127.0.0.1 -p 5555 -R
    # UDP
    iperf3 -uc 127.0.0.1 -p 5555 -b 0 -l <buffer_len> -R
    ```

默认情况下，`<buffer_len>` 针对 TCP 是 128KB，针对 UDP 是 8KB。扩大缓冲的长度也许可以提高性能。用户可以通过设置 `-l` 后的参数来改变这一长度。

注意，在使用 UDP 的时候，如果 `<buffer_len>` 大于了 `1472` （总的数据包长度超过了网卡的最大发送单元长度 MTU），数据包需要被切割，需要使能 [smoltcp](https://github.com/smoltcp-rs/smoltcp) 的 `fragmentation` feature：

```toml
# in ruxos/modules/axnet/Cargo.toml
[dependencies.smoltcp]
git = "https://github.com/rcore-os/smoltcp.git"
rev = "2ade274"
default-features = false
features = [
  "alloc", "log",   # no std
  "medium-ethernet",
  "proto-ipv4",
  "socket-raw", "socket-icmp", "socket-udp", "socket-tcp", "socket-dns",
  # "fragmentation-buffer-size-65536", "proto-ipv4-fragmentation",
  # "reassembly-buffer-size-65536", "reassembly-buffer-count-32",
  # "assembler-max-segment-count-32",
]
```
