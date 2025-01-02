// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="Introduction.html">简介</a></li><li class="chapter-item expanded affix "><li class="part-title">关于 RuxOS</li><li class="chapter-item expanded "><a href="chap01/Overview.html"><strong aria-hidden="true">1.</strong> RuxOS 概述</a></li><li class="chapter-item expanded affix "><li class="part-title">RuxOS 使用手册</li><li class="chapter-item expanded "><a href="chap02/getstarted.html"><strong aria-hidden="true">2.</strong> 运行现有应用</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap02/env-config.html"><strong aria-hidden="true">2.1.</strong> 环境配置说明</a></li><li class="chapter-item expanded "><a href="chap02/arguments.html"><strong aria-hidden="true">2.2.</strong> 编译参数及常用命令说明</a></li><li class="chapter-item expanded "><a href="chap02/apps/root.html"><strong aria-hidden="true">2.3.</strong> 现有应用及编程语言支持</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap02/apps/helloworld.html"><strong aria-hidden="true">2.3.1.</strong> Hello World!</a></li><li class="chapter-item expanded "><a href="chap02/apps/iperf.html"><strong aria-hidden="true">2.3.2.</strong> Iperf3</a></li><li class="chapter-item expanded "><a href="chap02/apps/sqlite.html"><strong aria-hidden="true">2.3.3.</strong> SQLite</a></li><li class="chapter-item expanded "><a href="chap02/apps/redis.html"><strong aria-hidden="true">2.3.4.</strong> Redis</a></li><li class="chapter-item expanded "><a href="chap02/apps/nginx.html"><strong aria-hidden="true">2.3.5.</strong> Nginx</a></li><li class="chapter-item expanded "><a href="chap02/apps/wamr.html"><strong aria-hidden="true">2.3.6.</strong> WAMR</a></li><li class="chapter-item expanded "><a href="chap02/apps/perl.html"><strong aria-hidden="true">2.3.7.</strong> Perl</a></li></ol></li><li class="chapter-item expanded "><a href="chap02/ELF-loader.html"><strong aria-hidden="true">2.4.</strong> 动态加载应用ELF文件</a></li></ol></li><li class="chapter-item expanded "><a href="chap03/your_app.html"><strong aria-hidden="true">3.</strong> 自定义应用</a></li><li class="chapter-item expanded "><a href="chap04/ruxgo.html"><strong aria-hidden="true">4.</strong> 使用 ruxgo 构建</a></li><li class="chapter-item expanded "><a href="chap05/multiplatforms.html"><strong aria-hidden="true">5.</strong> 多平台支持</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap05/Raspi4.html"><strong aria-hidden="true">5.1.</strong> Raspi4</a></li></ol></li><li class="chapter-item expanded "><li class="part-title">整体架构</li><li class="chapter-item expanded "><a href="chap06/design_overview.html"><strong aria-hidden="true">6.</strong> 设计概述</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap06/crates/crates.html"><strong aria-hidden="true">6.1.</strong> 底层组件</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap06/crates/drivers.html"><strong aria-hidden="true">6.1.1.</strong> 各类驱动</a></li><li class="chapter-item expanded "><a href="chap06/crates/kernel-tools.html"><strong aria-hidden="true">6.1.2.</strong> 内核数据结构</a></li><li class="chapter-item expanded "><a href="chap06/crates/algorithms.html"><strong aria-hidden="true">6.1.3.</strong> 内存分配及调度算法</a></li><li class="chapter-item expanded "><a href="chap06/crates/arch-related.html"><strong aria-hidden="true">6.1.4.</strong> 架构相关</a></li><li class="chapter-item expanded "><a href="chap06/crates/fs-IO.html"><strong aria-hidden="true">6.1.5.</strong> 文件系统及 IO 类</a></li><li class="chapter-item expanded "><a href="chap06/crates/pte-pt.html"><strong aria-hidden="true">6.1.6.</strong> 页表项及页表</a></li><li class="chapter-item expanded "><a href="chap06/crates/percpu.html"><strong aria-hidden="true">6.1.7.</strong> percpu类</a></li></ol></li><li class="chapter-item expanded "><a href="chap06/modules/modules.html"><strong aria-hidden="true">6.2.</strong> 功能模块</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap06/modules/config-and-initialization.html"><strong aria-hidden="true">6.2.1.</strong> 配置及运行时初始化</a></li><li class="chapter-item expanded "><a href="chap06/modules/tools.html"><strong aria-hidden="true">6.2.2.</strong> 调试及开发工具</a></li><li class="chapter-item expanded "><a href="chap06/modules/kernel-submodules.html"><strong aria-hidden="true">6.2.3.</strong> 内核子模块</a></li><li class="chapter-item expanded "><a href="chap06/modules/9pfs.html"><strong aria-hidden="true">6.2.4.</strong> 9pfs</a></li></ol></li></ol></li><li class="chapter-item expanded "><a href="chap07/ulib/ulib.html"><strong aria-hidden="true">7.</strong> 用户库</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="chap07/ulib/ruxos-posix-api.html"><strong aria-hidden="true">7.1.</strong> ruxos-posix-api</a></li><li class="chapter-item expanded "><a href="chap07/ulib/ruxlibc.html"><strong aria-hidden="true">7.2.</strong> ruxlibc</a></li><li class="chapter-item expanded "><a href="chap07/ulib/ruxmusl.html"><strong aria-hidden="true">7.3.</strong> ruxmusl</a></li></ol></li><li class="chapter-item expanded "><li class="part-title">未来工作</li><li class="chapter-item expanded "><div><strong aria-hidden="true">8.</strong> TODO</div></li><li class="chapter-item expanded affix "><li class="spacer"></li><li class="chapter-item expanded affix "><a href="Contributors.html">贡献者</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
