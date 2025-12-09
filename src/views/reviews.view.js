/**
 * Reviews View
 * Xử lý logic render và sự kiện cho trang Quản lý đánh giá
 */
import { ReviewsService } from '../services/reviews.service.js';

export const ReviewsView = {
    async render(App, Router) {
        const params = Router.getQueryParams();
        const data = await ReviewsService.getList(params);
        await App.renderPage('reviews', data, true);
        this.bindEvents(App, Router);
    },

    bindEvents(App, Router) {
        const filterForm = document.getElementById('reviewFilterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(filterForm);
                const params = new URLSearchParams();
                formData.forEach((value, key) => {
                    if (value) params.append(key, value);
                });
                Router.navigate(`/reviews?${params.toString()}`);
            });
        }

        document.querySelectorAll('[data-action="hideReview"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const reviewId = btn.dataset.id;
                await this.handleToggleVisibility(reviewId, false, App);
            });
        });

        document.querySelectorAll('[data-action="showReview"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const reviewId = btn.dataset.id;
                await this.handleToggleVisibility(reviewId, true, App);
            });
        });

        document.querySelectorAll('[data-action="replyReview"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const reviewId = btn.dataset.id;
                this.showReplyForm(reviewId);
            });
        });

        document.querySelectorAll('.reply-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const reviewId = form.dataset.reviewId;
                const reply = form.querySelector('textarea').value;
                await this.handleReply(reviewId, reply, App);
            });
        });
    },

    async handleToggleVisibility(reviewId, visible, App) {
        try {
            const result = visible 
                ? await ReviewsService.show(reviewId)
                : await ReviewsService.hide(reviewId);
            if (result.success) {
                App.showSuccess(visible ? 'Đã hiện đánh giá!' : 'Đã ẩn đánh giá!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    showReplyForm(reviewId) {
        const form = document.querySelector(`.reply-form[data-review-id="${reviewId}"]`);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            form.querySelector('textarea')?.focus();
        }
    },

    async handleReply(reviewId, reply, App) {
        if (!reply.trim()) {
            App.showError('Vui lòng nhập nội dung phản hồi');
            return;
        }
        try {
            const result = await ReviewsService.reply(reviewId, reply);
            if (result.success) {
                App.showSuccess('Đã gửi phản hồi thành công!');
                App.reload();
            }
        } catch (error) {
            App.showError('Gửi phản hồi thất bại. Vui lòng thử lại.');
        }
    }
};
