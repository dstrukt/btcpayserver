// Point of Sale "Product Sales" page: client-side tab switching, search, category
// filtering, and the per-product inline drill-down. All data is server-rendered;
// this only shows/hides rows and keeps the Export link pointed at the active tab.
(function () {
    // Align the report's day boundaries with the viewer's timezone: on first load, hand
    // the browser's UTC offset to the server (once) so the window, "Today" boundary and
    // chart buckets match local time. UTC viewers (offset 0) already match the default.
    const url = new URL(window.location.href);
    if (!url.searchParams.has('tzOffset')) {
        const offset = new Date().getTimezoneOffset();
        if (offset !== 0) {
            url.searchParams.set('tzOffset', offset);
            window.location.replace(url.pathname + url.search);
            return;
        }
    }

    const search = document.getElementById('ProductSalesSearch');
    const searchClear = document.getElementById('ProductSalesSearchClear');
    const category = document.getElementById('ProductSalesCategory');
    const exportLink = document.getElementById('ProductSalesExport');
    const tabs = [...document.querySelectorAll('.product-sales__tab')];
    const views = [...document.querySelectorAll('.product-sales__view')];
    if (!search || tabs.length === 0) return;

    let activeTab = 'products';

    const detailFor = row => document.querySelector(`.product-sales__detail-row[data-detail="${row.dataset.index}"]`);

    const collapse = row => {
        row.setAttribute('aria-expanded', 'false');
        const detail = detailFor(row);
        if (detail) detail.classList.add('d-none');
    };

    const collapseAll = () => document.querySelectorAll('.product-sales__row').forEach(collapse);

    const applyFilter = () => {
        const term = search.value.trim().toLowerCase();
        const cat = category ? category.value : '';
        if (searchClear) searchClear.classList.toggle('d-none', search.value.length === 0);
        if (activeTab === 'products') {
            document.querySelectorAll('.product-sales__row').forEach(row => {
                const matchesTerm = !term || (row.dataset.name || '').includes(term);
                const matchesCat = !cat || (row.dataset.category || '') === cat;
                const show = matchesTerm && matchesCat;
                row.classList.toggle('d-none', !show);
                if (!show) collapse(row);
            });
        } else {
            document.querySelectorAll('.product-sales__order').forEach(row => {
                row.classList.toggle('d-none', !(!term || (row.dataset.search || '').includes(term)));
            });
        }
    };

    const setTab = tab => {
        activeTab = tab;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        views.forEach(v => v.classList.toggle('d-none', v.dataset.view !== tab));
        // The category filter only applies to products
        if (category) category.classList.toggle('d-none', tab !== 'products');
        search.placeholder = tab === 'orders' ? search.dataset.phOrders : search.dataset.phProducts;
        // Keep the Export link exporting whatever is on screen
        if (exportLink) {
            const url = new URL(exportLink.href, window.location.origin);
            url.searchParams.set('tab', tab);
            exportLink.href = url.pathname + url.search;
        }
        applyFilter();
    };

    tabs.forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));
    search.addEventListener('input', applyFilter);
    if (category) category.addEventListener('change', applyFilter);
    if (searchClear) searchClear.addEventListener('click', () => {
        search.value = '';
        search.focus();
        applyFilter();
    });

    // Clicking a product row expands its inline drill-down (chart + recent sales)
    document.querySelectorAll('.product-sales__row').forEach(row => {
        row.addEventListener('click', () => {
            const detail = detailFor(row);
            if (!detail) return;
            const expanded = row.getAttribute('aria-expanded') === 'true';
            row.setAttribute('aria-expanded', (!expanded).toString());
            detail.classList.toggle('d-none', expanded);
        });
    });

    // "View all X sales" jumps to the Orders tab filtered by that product
    document.querySelectorAll('.product-sales__view-all').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            setTab('orders');
            search.value = link.dataset.product || '';
            applyFilter();
        });
    });

    // Sortable column headers (both tabs). Sort values live on each row as data-sort-*
    // so we compare raw numbers/dates, not the formatted display text. Product rows keep
    // their drill-down detail row alongside them when reordered.
    const sortValue = (row, key, type) => {
        const raw = row.dataset['sort' + key.charAt(0).toUpperCase() + key.slice(1)] || '';
        return type === 'number' ? (parseFloat(raw) || 0) : raw;
    };

    document.querySelectorAll('.product-sales__table thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const table = th.closest('table');
            const tbody = table.tBodies[0];
            const thead = th.closest('thead');
            const key = th.dataset.sort;
            const type = th.dataset.sortType || 'text';
            const asc = th.getAttribute('aria-sort') !== 'ascending';
            thead.querySelectorAll('th[data-sort]').forEach(h => h.removeAttribute('aria-sort'));
            th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
            const dir = asc ? 1 : -1;
            const cmp = (a, b) => {
                const va = sortValue(a, key, type), vb = sortValue(b, key, type);
                if (type === 'number') return (va - vb) * dir;
                return String(va).localeCompare(String(vb)) * dir;
            };
            const productRows = [...tbody.querySelectorAll('.product-sales__row')];
            if (productRows.length) {
                productRows.sort(cmp).forEach(row => {
                    tbody.appendChild(row);
                    const detail = detailFor(row);
                    if (detail) tbody.appendChild(detail);
                });
            } else {
                [...tbody.querySelectorAll('.product-sales__order')].sort(cmp).forEach(row => tbody.appendChild(row));
            }
        });
    });
})();
