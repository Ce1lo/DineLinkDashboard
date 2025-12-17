/**
 * Header View
 * Xử lý logic cho thanh header, đặc biệt là tính năng tìm kiếm
 */
import { BookingsService } from '../services/bookings.service.js';
import { BookingDetailModal } from '../components/booking-detail-modal.js';

export const HeaderView = {
    init(App, Router) {
        this.bindEvents(App, Router);
    },

    bindEvents(App, Router) {
        const searchInput = document.getElementById('headerSearchInput');
        const searchResults = document.getElementById('headerSearchResults');
        const searchContainer = document.getElementById('headerSearchContainer');

        if (!searchInput || !searchResults) return;

        let debounceTimer;

        // Xử lý input search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(debounceTimer);
            
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                searchResults.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(() => {
                this.handleSearch(query, searchResults);
            }, 300);
        });

        // Xử lý click outside để đóng dropdown
        document.addEventListener('click', (e) => {
            if (searchContainer && !searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });

        // Xử lý focus lại input
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2 && searchResults.children.length > 0) {
                searchResults.classList.remove('hidden');
            }
        });
    },

    async handleSearch(query, resultsContainer) {
        // Show loading
        resultsContainer.innerHTML = `
            <div class="p-4 text-center text-stone-500">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tìm kiếm...
            </div>
        `;
        resultsContainer.classList.remove('hidden');

        try {
            // Gọi API search
            const result = await BookingsService.getList({ q: query, limit: 5 });
            const data = result.data || {};
            let bookings = Array.isArray(data) ? data : (data.items || []);

            // Map Data (snake_case -> camelCase) to ensure display matches
            bookings = bookings.map(b => ({
                id: b.id,
                customerName: b.customer_name || (b.user ? b.user.display_name : 'Khách vãng lai'),
                customerPhone: b.phone || (b.user ? b.user.phone : ''),
                status: b.status,
                datetime: b.booking_time || b.created_at
            }));

            this.renderResults(bookings, resultsContainer, query);

        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i>Lỗi tìm kiếm
                </div>
            `;
        }
    },

    renderResults(bookings, container, query) {
        if (!bookings || bookings.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-stone-500">
                    <i class="fa-solid fa-magnifying-glass-minus mr-2"></i>
                    Không tìm thấy kết quả cho "${query}"
                </div>
            `;
            return;
        }

        const html = bookings.map(booking => {
            const statusMap = {
                'PENDING': { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-700' },
                'CONFIRMED': { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-700' },
                'CHECKED_IN': { label: 'Đã check-in', class: 'bg-green-100 text-green-700' },
                'CANCELLED': { label: 'Đã hủy', class: 'bg-red-100 text-red-700' },
                'NO_SHOW': { label: 'Bỏ cọc', class: 'bg-stone-100 text-stone-700' }
            };
            const status = statusMap[booking.status] || { label: booking.status, class: 'bg-gray-100 text-gray-700' };

            return `
                <div class="flex items-center gap-3 p-3 hover:bg-stone-50 cursor-pointer border-b last:border-0 border-stone-50 transition-colors"
                     data-action="header-search-result"
                     data-booking-id="${booking.id}">
                    <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold shrink-0">
                        ${this.getInitials(booking.customerName)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h5 class="font-medium text-stone-900 truncate">${booking.customerName}</h5>
                            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${status.class}">${status.label}</span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-stone-500 mt-0.5">
                            <span class="flex items-center gap-1"><i class="fa-solid fa-phone text-xs"></i> ${booking.customerPhone || '---'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Bind click events
        container.querySelectorAll('[data-action="header-search-result"]').forEach(item => {
            item.addEventListener('click', () => {
                const bookingId = item.dataset.bookingId;
                // Close results
                container.classList.add('hidden');
                // Open modal using Shared Component
                BookingDetailModal.show(bookingId);
            });
        });
    },

    getInitials(name) {
        if (!name) return 'KH';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
};
