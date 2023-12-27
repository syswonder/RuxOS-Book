# Welcome to RuxOS!

This project is the manual for RuxOS, targeting both application developers and kernel developers. It covers the following aspects:

* Overview of RuxOS

* Running applications on RuxOS

* Overall design of RuxOS

The RuxOS manual is still a work in progress.

# What is RuxOS?

RuxOS is a lightweight library operating system compatible with Linux applications. It primarily follows the design principles of [unikernels](https://en.wikipedia.org/wiki/Unikernel) and is maintained by the [syswonder Community](https://www.syswonder.org/#/).

Given the prevalent edge computing scenarios where the number of applications is often limited and relatively fixed, RuxOS simplifies the operating system design to support a single application. It encapsulates kernel functionality as a library, providing it to applications in the form of system calls, allowing applications to run directly in kernel mode.

This library-based operating system enhances application performance significantly. Security concerns are mainly addressed by the underlying Type 1 hypervisor ([hvisor](https://github.com/syswonder/hvisor)). Library-based operating systems require robust tool support to facilitate the generation of runnable binary images based on a single application, such as [unikraft](https://unikraft.org/).

RuxOS is still in the development stage and has already achieved support for several mainstream applications.
