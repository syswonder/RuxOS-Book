# SQLite

[SQLite](https://sqlite.org/) 是使用 C 语言实现的一款轻量 SQL 数据库引擎。RuxOS 支持了 SQLite，并针对常用 SQL 语句进行了[测试](https://github.com/syswonder/ruxos/blob/main/apps/c/sqlite3/main.c)，除了 SQL 语句的正确性测试以外，还能借助块设备进行数据持久化。

## 运行命令

通过在 RuxOS 根目录执行下面命令，可以基于 ruxlibc 运行起来 SQLite。

```bash
make A=apps/c/sqlite3/ LOG=error BLK=y run
```

参数解释：

- `A`：SQLite 的测试程序 main 函数所在目录路径。

- `LOG`：运行的日志等级，不同的日志等级能够打印出不同的调试信息。

- `BLK`：使用块设备进行数据持久化。


## 运行结果

一个可能的运行结果如下所示：

```shell
SeaBIOS (version rel-1.16.3-0-ga6ed6b701f0a-prebuilt.qemu.org)


iPXE (http://ipxe.org) 00:02.0 CA00 PCI2.10 PnP PMM+7EFD0AA0+7EF30AA0 CA00
                                                                               


Booting from ROM..
Initialize IDT & GDT...

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

[  0.131281 0 axfs_ramfs::dir:55] AlreadyExists sys
sqlite version: 3.41.1
sqlite open memory status 0 
======== init user table ========
sqlite exec:
    create table user(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT,password TEXT)
======== insert user 1, 2, 3 into user table ========
sqlite exec:
    insert into user (username, password) VALUES ('memory_1', 'password1'), ('memory_2', 'password2'), ('memory_3', 'password3')
======== select all ========
sqlite query:
    select * from user
id = 1
username = memory_1
password = password1

id = 2
username = memory_2
password = password2

id = 3
username = memory_3
password = password3

======== select id = 2 ========
sqlite query:
    select * from user where id = 2
id = 2
username = memory_2
password = password2

sqlite open /file.sqlite status 0 
======== init user table ========
sqlite exec:
    create table user(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT,password TEXT)
======== insert user 1, 2, 3 into user table ========
sqlite exec:
    insert into user (username, password) VALUES ('file_1', 'password1'), ('file_2', 'password2'), ('file_3', 'password3')
======== select all ========
sqlite query:
    select * from user
id = 1
username = file_1
password = password1

id = 2
username = file_2
password = password2

id = 3
username = file_3
password = password3

======== select id = 2 ========
sqlite query:
    select * from user where id = 2
id = 2
username = file_2
password = password2
```

再次运行上述命令，可得到如下运行结果：

```shell
SeaBIOS (version rel-1.16.3-0-ga6ed6b701f0a-prebuilt.qemu.org)


iPXE (http://ipxe.org) 00:02.0 CA00 PCI2.10 PnP PMM+7EFD0AA0+7EF30AA0 CA00
                                                                               


Booting from ROM..
Initialize IDT & GDT...

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

[  0.130932 0 axfs_ramfs::dir:55] AlreadyExists sys
sqlite version: 3.41.1
sqlite open memory status 0 
======== init user table ========
sqlite exec:
    create table user(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT,password TEXT)
======== insert user 1, 2, 3 into user table ========
sqlite exec:
    insert into user (username, password) VALUES ('memory_1', 'password1'), ('memory_2', 'password2'), ('memory_3', 'password3')
======== select all ========
sqlite query:
    select * from user
id = 1
username = memory_1
password = password1

id = 2
username = memory_2
password = password2

id = 3
username = memory_3
password = password3

======== select id = 2 ========
sqlite query:
    select * from user where id = 2
id = 2
username = memory_2
password = password2

sqlite open /file.sqlite status 0 
======== init user table ========
sqlite exec:
    create table user(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT,password TEXT)
sqlite exec error: table user already exists
======== insert user 1, 2, 3 into user table ========
sqlite exec:
    insert into user (username, password) VALUES ('file_1', 'password1'), ('file_2', 'password2'), ('file_3', 'password3')
======== select all ========
sqlite query:
    select * from user
id = 1
username = file_1
password = password1

id = 2
username = file_2
password = password2

id = 3
username = file_3
password = password3

id = 4
username = file_1
password = password1

id = 5
username = file_2
password = password2

id = 6
username = file_3
password = password3

======== select id = 2 ========
sqlite query:
    select * from user where id = 2
id = 2
username = file_2
password = password2
```

出现差异的原因是第一次运行之后进行了数据持久化，再次运行时，上次存储的键值对仍然在块设备上。

如果运行下列命令，则数据不会进行持久化：

```bash
make A=apps/c/sqlite3/ LOG=error BLK=y run FEATURES=driver-ramdisk
```




