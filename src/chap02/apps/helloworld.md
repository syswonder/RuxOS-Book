
# Hello World!

RuxOS 借助 make 工具，为用户提供了完善而便捷的方式来运行应用。

例如一个最简单的 hello world 应用，源码如下：

```C
#include <stdio.h>

int main()
{
    printf("Hello, %c app!\n", 'C');
    return 0;
}
```

运行方式为：

```shell
make A=apps/c/helloworld run
```

参数解释：

* `A`: 该参数指向运行的应用程序的目录

通过运行上述命令，一个简单的 C 应用就成功启动了，一个可能的运行示例结果显示如下：

```shell
8888888b.                     .d88888b.   .d8888b.  
888   Y88b                   d88P" "Y88b d88P  Y88b 
888    888                   888     888 Y88b.      
888   d88P 888  888 888  888 888     888  "Y888b.   
8888888P"  888  888 `Y8bd8P' 888     888     "Y88b. 
888 T88b   888  888   X88K   888     888       "888 
888  T88b  Y88b 888 .d8""8b. Y88b. .d88P Y88b  d88P 
888   T88b  "Y88888 888  888  "Y88888P"   "Y8888P" 

arch = x86_64
platform = x86_64-qemu-q35
target = x86_64-unknown-none
smp = 1
build_mode = release
log_level = error

Hello, C app!
```

