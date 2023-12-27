# Hello World!

RuxOS, with the assistance of the make tool, provides users with a comprehensive and convenient way to run applications.

For example, consider the simplest hello world application with the following source code in C:

```C
#include <stdio.h>

int main()
{
    printf("Hello, %c app!\n", 'C');
    return 0;
}
```

To run the application, use the following command:

```shell
make A=apps/c/helloworld run
```

Parameter explanation:

* `A`: This parameter points to the directory of the application to be executed.

By running the above command, a simple C application is successfully launched. An example of the possible output is as follows:

```
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
