
# 页表项及页表

RuxOS 提供了 x86_64、AArch64、Risc-V64 三种架构的页表项、页表及相关方法的定义和实现。

### 页表项 page table entry

页表项组件定义了页表项的基本方法：

```rust
/// A generic page table entry.
///
/// All architecture-specific page table entry types implement this trait.
pub trait GenericPTE: Debug + Clone + Copy + Sync + Send + Sized {
    /// Creates a page table entry point to a terminate page or block.
    fn new_page(paddr: PhysAddr, flags: MappingFlags, is_huge: bool) -> Self;
    /// Creates a page table entry point to a next level page table.
    fn new_table(paddr: PhysAddr) -> Self;

    /// Returns the physical address mapped by this entry.
    fn paddr(&self) -> PhysAddr;
    /// Returns the flags of this entry.
    fn flags(&self) -> MappingFlags;

    /// Set mapped physical address of the entry.
    fn set_paddr(&mut self, paddr: PhysAddr);
    /// Set flags of the entry.
    fn set_flags(&mut self, flags: MappingFlags, is_huge: bool);

    /// Returns whether this entry is zero.
    fn is_unused(&self) -> bool;
    /// Returns whether this entry flag indicates present.
    fn is_present(&self) -> bool;
    /// For non-last level translation, returns whether this entry maps to a
    /// huge frame.
    fn is_huge(&self) -> bool;
    /// Set this entry to zero.
    fn clear(&mut self);
}
```

基于 GenericPTE trait，分别进行了三种架构的数据结构实现，实现过程遵守标准的架构规范：

- **X64PTE**：x86_64 页表项，64位，借助 Rust 第三方库 [`x86_64`](https://crates.io/crates/x86_64) 解析页表项标志位。

- **A64PTE**：AArch64 页表项，64位，12-48为地址有效位，支持了 AArch64 规范的页描述符相关属性和方法。

- **Rv64PTE**：Risc-V64 页表项，64位。

### 页表 page table

提供三种架构的页表数据结构实现：

- **X64PageTable**：x86_64 页表，支持4级页表，最大52位物理地址，48位虚拟地址。

- **A64PageTable**：AArch64 页表，支持4级页表，最大48位物理地址，48位虚拟地址。

- **Sv39PageTable**：Risc-V64 页表，支持3级页表，最大56位物理地址，39位虚拟地址。

- **Sv48PageTable**：Risc-V64 页表，支持4级页表，最大56位物理地址，48位虚拟地址。

提供以下方法：

```rust
impl<M: PagingMetaData, PTE: GenericPTE, IF: PagingIf> PageTable64<M, PTE, IF> {
    /// Creates a new page table instance or returns the error.
    ///
    /// It will allocate a new page for the root page table.
    pub fn try_new() -> PagingResult<Self> {...}

    /// Returns the physical address of the root page table.
    pub const fn root_paddr(&self) -> PhysAddr {...}

    /// Maps a virtual page to a physical frame with the given `page_size`
    /// and mapping `flags`.
    ///
    /// The virtual page starts with `vaddr`, amd the physical frame starts with
    /// `target`. If the addresses is not aligned to the page size, they will be
    /// aligned down automatically.
    ///
    /// Returns [`Err(PagingError::AlreadyMapped)`](PagingError::AlreadyMapped)
    /// if the mapping is already present.
    pub fn map(
        &mut self,
        vaddr: VirtAddr,
        target: PhysAddr,
        page_size: PageSize,
        flags: MappingFlags,
    ) -> PagingResult {...}

    /// Unmaps the mapping starts with `vaddr`.
    ///
    /// Returns [`Err(PagingError::NotMapped)`](PagingError::NotMapped) if the
    /// mapping is not present.
    pub fn unmap(&mut self, vaddr: VirtAddr) -> PagingResult<(PhysAddr, PageSize)> {...}

    /// Query the result of the mapping starts with `vaddr`.
    ///
    /// Returns the physical address of the target frame, mapping flags, and
    /// the page size.
    ///
    /// Returns [`Err(PagingError::NotMapped)`](PagingError::NotMapped) if the
    /// mapping is not present.
    pub fn query(&self, vaddr: VirtAddr) -> PagingResult<(PhysAddr, MappingFlags, PageSize)> {...}

    /// Updates the target or flags of the mapping starts with `vaddr`. If the
    /// corresponding argument is `None`, it will not be updated.
    ///
    /// Returns the page size of the mapping.
    ///
    /// Returns [`Err(PagingError::NotMapped)`](PagingError::NotMapped) if the
    /// mapping is not present.
    pub fn update(
        &mut self,
        vaddr: VirtAddr,
        paddr: Option<PhysAddr>,
        flags: Option<MappingFlags>,
    ) -> PagingResult<PageSize> {...}

    /// Map a contiguous virtual memory region to a contiguous physical memory
    /// region with the given mapping `flags`.
    ///
    /// The virtual and physical memory regions start with `vaddr` and `paddr`
    /// respectively. The region size is `size`. The addresses and `size` must
    /// be aligned to 4K, otherwise it will return [`Err(PagingError::NotAligned)`].
    ///
    /// When `allow_huge` is true, it will try to map the region with huge pages
    /// if possible. Otherwise, it will map the region with 4K pages.
    ///
    /// [`Err(PagingError::NotAligned)`]: PagingError::NotAligned
    pub fn map_region(
        &mut self,
        vaddr: VirtAddr,
        paddr: PhysAddr,
        size: usize,
        flags: MappingFlags,
        allow_huge: bool,
    ) -> PagingResult {...}

    /// Unmap a contiguous virtual memory region.
    ///
    /// The region must be mapped before using [`PageTable64::map_region`], or
    /// unexpected behaviors may occur.
    pub fn unmap_region(&mut self, vaddr: VirtAddr, size: usize) -> PagingResult {...}

    /// Walk the page table recursively.
    ///
    /// When reaching the leaf page table, call `func` on the current page table
    /// entry. The max number of enumerations in one table is limited by `limit`.
    ///
    /// The arguments of `func` are:
    /// - Current level (starts with `0`): `usize`
    /// - The index of the entry in the current-level table: `usize`
    /// - The virtual address that is mapped to the entry: [`VirtAddr`]
    /// - The reference of the entry: [`&PTE`](GenericPTE)
    pub fn walk<F>(&self, limit: usize, func: &F) -> PagingResult
    where
        F: Fn(usize, usize, VirtAddr, &PTE),
    {...}
}
```
