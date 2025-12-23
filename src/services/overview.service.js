/**
 * Overview Service - PRODUCTION VERSION (ES6)
 * Tổng hợp data từ các API có sẵn để hiển thị dashboard overview
 */
import { ApiService } from './api.js';

export const OverviewService = {
    async getOverview() {
        try {
            // Gọi song song các API có sẵn
            const [bookingsRes, restaurantRes, tablesRes] = await Promise.all([
                ApiService.get('/bookings').catch(() => ({ data: [] })),
                ApiService.get('/restaurants/me').catch(() => ({ data: {} })),
                ApiService.get('/tables').catch(() => ({ data: [] }))
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
                const bookingDate = new Date(b.booking_time || b.booking_date || b.date);
                return bookingDate >= today && bookingDate < tomorrow;
            }) : [];
            
            const pendingBookingsArr = Array.isArray(bookings) ? bookings.filter(b => 
                b.status === 'PENDING' || b.status === 'pending'
            ) : [];

            // Calculate Guests Today (from confirmed/checked-in/pending bookings today)
            const guestsToday = todayBookingsArr.reduce((sum, b) => {
                // Only count valid bookings
                if (b.status === 'CANCELLED' || b.status === 'REJECTED') return sum;
                return sum + (parseInt(b.people_count) || parseInt(b.guest_count) || 0);
            }, 0);

            // Calculate Total Capacity
            const totalCapacity = tables.reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0);

            // Calculate Occupancy (Guests Today / Total Capacity * 100)
            // This is a rough estimate. Ideally needs time-slot analysis.
            const occupancy = totalCapacity > 0 ? Math.min(Math.round((guestsToday / totalCapacity) * 100), 100) : 0;
            
            const upcomingBookings = Array.isArray(bookings) ? bookings
                .filter(b => {
                    const bookingDate = new Date(b.booking_time || b.booking_date || b.date);
                    return bookingDate >= now && (b.status === 'PENDING' || b.status === 'CONFIRMED');
                })
                .sort((a, b) => new Date(a.booking_time || a.booking_date) - new Date(b.booking_time || b.booking_date))
                .slice(0, 5) : [];
            
            // Create lookup map: table_id -> table_name
            const tableMap = {};
            tables.forEach(t => {
                tableMap[t.id] = t.name;
            });

            // Format upcoming bookings for display
            const formattedUpcoming = upcomingBookings.map(b => {
                const date = new Date(b.booking_time || b.booking_date || b.date);
                return {
                    id: b.id,
                    time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    customerName: b.customer_name || b.user?.display_name || 'Khách vãng lai',
                    customerPhone: b.phone || b.customer_phone || '',
                    guests: b.people_count || b.guest_count || 0,
                    // Lookup table name from tableMap using table_id
                    table: b.table?.name || b.table_name || (b.table_id ? tableMap[b.table_id] : null),
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
            console.error('Error fetching overview data:', error);
            // Return default data để dashboard vẫn render được
            return {
                kpis: { bookingsToday: 0, guestsToday: 0, pendingBookings: 0, tableOccupancy: 0 },
                upcomingBookings: [],
                restaurant: {},
                success: false
            };
        }
    }
};
