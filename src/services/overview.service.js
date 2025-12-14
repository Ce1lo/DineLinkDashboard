/**
 * Overview Service - PRODUCTION VERSION (ES6)
 * Tổng hợp data từ các API có sẵn để hiển thị dashboard overview
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const OverviewService = {
    async getOverview() {
        // 1. Force Mock Mode if configured
        if (CONFIG.USE_MOCK) {
            console.log('🎭 Using Mock Data for Overview');
            return MockHandlers.getOverview();
        }

        try {
            // 2. Try calling Real Backend APIs
            
            // Gọi song song các API có sẵn
            const [bookingsRes, restaurantRes, tablesRes] = await Promise.all([
                ApiService.get('/bookings').catch(err => { throw err; }), // Throw to trigger fallback
                ApiService.get('/restaurants/me').catch(err => { throw err; }),
                ApiService.get('/tables').catch(err => { throw err; })
            ]);
            
            // Parse data
            const bookingsData = bookingsRes.data || bookingsRes || [];
            const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.items || []);
            
            const restaurant = restaurantRes.data || restaurantRes || {};

            const tablesData = tablesRes.data || tablesRes || [];
            const tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || []);
            
            // Tính toán thống kê
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24*60*60*1000);
            
            const todayBookingsArr = Array.isArray(bookings) ? bookings.filter(b => {
                const bookingDate = new Date(b.booking_date || b.date);
                return bookingDate >= today && bookingDate < tomorrow;
            }) : [];
            
            const pendingBookingsArr = Array.isArray(bookings) ? bookings.filter(b => 
                b.status === 'PENDING' || b.status === 'pending'
            ) : [];

            // Calculate Guests Today (from confirmed/checked-in/pending bookings today)
            const guestsToday = todayBookingsArr.reduce((sum, b) => {
                // Only count valid bookings
                if (b.status === 'CANCELLED' || b.status === 'REJECTED') return sum;
                return sum + (parseInt(b.guest_count) || 0);
            }, 0);

            // Calculate Total Capacity
            const totalCapacity = tables.reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0);

            // Calculate Occupancy (Guests Today / Total Capacity * 100)
            const occupancy = totalCapacity > 0 ? Math.min(Math.round((guestsToday / totalCapacity) * 100), 100) : 0;
            
            const upcomingBookings = Array.isArray(bookings) ? bookings
                .filter(b => {
                    const bookingDate = new Date(b.booking_date || b.date);
                    return bookingDate >= now && (b.status === 'PENDING' || b.status === 'CONFIRMED');
                })
                .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
                .slice(0, 5) : [];
            
            // Format upcoming bookings for display
            const formattedUpcoming = upcomingBookings.map(b => {
                const date = new Date(b.booking_date || b.date);
                return {
                    id: b.id,
                    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    customerName: b.customer_name || 'Khách vãng lai',
                    customerPhone: b.customer_phone || '',
                    guests: b.guest_count || 0,
                    table: b.table_name || (b.Table ? b.Table.name : null),
                    status: b.status
                };
            });

            return {
                kpis: {
                    bookingsToday: todayBookingsArr.length,
                    guestsToday: guestsToday,
                    pendingBookings: pendingBookingsArr.length,
                    tableOccupancy: occupancy
                },
                upcomingBookings: formattedUpcoming,
                restaurant: restaurant,
                success: true
            };
        } catch (error) {
            console.warn('⚠️ Real Backend unavailable, switching to Mock Data...', error);
            
            // 3. Fallback to Mock Data if Real API fails
            try {
                const mockData = await MockHandlers.getOverview();
                // MockHandlers usually returns { kpis, upcomingBookings ... } structure directly
                // We ensure 'success: true' is added if needed, though MockHandlers usually returns objects.
                return {
                    ...mockData,
                    success: true,
                    _isMock: true // Marker to debug
                };
            } catch (mockErr) {
                 console.error('Fatal: Both Backend and Mock failed', mockErr);
                 return {
                    kpis: { bookingsToday: 0, guestsToday: 0, pendingBookings: 0, tableOccupancy: 0 },
                    upcomingBookings: [],
                    restaurant: {},
                    success: false
                 };
            }
        }
    }
};
