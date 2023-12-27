# Iperf3

[iPerf3](https://github.com/esnet/iperf) is a tool used to test real-time bandwidth performance in networks.

## Build and Run

Launch the iPerf3 server on RuxOS using the following command:

```bash
# in ruxos root directory
make A=apps/c/iperf BLK=y NET=y ARCH=<arch> run
```

## Benchmark Testing

Open another terminal and run the iPerf3 client:

* RuxOS-iperf3 as the receiver:

    ```bash
    # TCP
    iperf3 -c 127.0.0.1 -p 5555
    # UDP
    iperf3 -uc 127.0.0.1 -p 5555 -b <sender_bitrate> -l <buffer_len>
    ```

    Users need to set the `<sender_bitrate>` parameter to avoid sending packets too quickly when using UDP.

* RuxOS-iperf3 as the sender:

    ```bash
    # TCP
    iperf3 -c 127.0.0.1 -p 5555 -R
    # UDP
    iperf3 -uc 127.0.0.1 -p 5555 -b 0 -l <buffer_len> -R
    ```

By default, `<buffer_len>` is 128KB for TCP and 8KB for UDP. Increasing the buffer length may improve performance. Users can change this length by setting the parameter after `-l`.

Note that when using UDP, if `<buffer_len>` exceeds `1472` (total packet length exceeds the maximum transmission unit MTU of the network card), packets need to be fragmented. This requires enabling the `fragmentation` feature of [smoltcp](https://github.com/smoltcp-rs/smoltcp):

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
