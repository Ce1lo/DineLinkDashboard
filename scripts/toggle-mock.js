/**
 * Toggle Mock Script (ES6 Module Version)
 * Chuyển đổi giữa Mock (dùng MockHandlers) và Production (gọi API thực)
 * 
 * Sử dụng:
 *   node scripts/toggle-mock.js mock   - Bật chế độ Mock
 *   node scripts/toggle-mock.js prod   - Bật chế độ Production
 *   node scripts/toggle-mock.js status - Xem trạng thái hiện tại
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT = path.join(__dirname, '..');
const SRC_SERVICES = path.join(ROOT, 'src', 'services');
const MOCK_SERVICES = path.join(SRC_SERVICES, 'mock-versions');
const PROD_SERVICES = path.join(SRC_SERVICES, 'prod-versions');
const CONFIG_FILE = path.join(ROOT, 'src', 'config.js');

// Service files to copy
const SERVICE_FILES = [
    'api.js',
    'auth.service.js',
    'overview.service.js',
    'bookings.service.js',
    'tables.service.js',
    'images.service.js',
    'reviews.service.js',
    'notifications.service.js',
    'restaurant.service.js',
    'accounts.service.js',
    'profile.service.js'
];

// Colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Copy service files from source to dest
 */
function copyServices(sourceDir, destDir) {
    let copied = 0;
    for (const file of SERVICE_FILES) {
        const src = path.join(sourceDir, file);
        const dest = path.join(destDir, file);
        
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            copied++;
            log(`  ✓ ${file}`, 'dim');
        } else {
            log(`  ✗ ${file} (not found)`, 'red');
        }
    }
    return copied;
}

/**
 * Update config.js USE_MOCK value
 */
function updateConfig(useMock) {
    let content = fs.readFileSync(CONFIG_FILE, 'utf8');
    content = content.replace(
        /USE_MOCK:\s*(true|false)/,
        `USE_MOCK: ${useMock}`
    );
    fs.writeFileSync(CONFIG_FILE, content, 'utf8');
}

/**
 * Get current mode by checking auth.service.js content
 */
function getCurrentMode() {
    const authService = path.join(SRC_SERVICES, 'auth.service.js');
    if (!fs.existsSync(authService)) return 'unknown';
    
    const content = fs.readFileSync(authService, 'utf8');
    return content.includes('MockHandlers') ? 'mock' : 'prod';
}

/**
 * Enable Mock mode
 */
function enableMock() {
    log('\n🔄 Đang chuyển sang chế độ MOCK...', 'yellow');
    
    // Check if mock-versions exists
    if (!fs.existsSync(MOCK_SERVICES)) {
        log('\n❌ Thư mục mock-versions không tồn tại!', 'red');
        log('   Chạy: node scripts/manage-mock.js restore', 'dim');
        return;
    }
    
    // Copy mock services
    log('\n📦 Copying mock services:', 'cyan');
    const copied = copyServices(MOCK_SERVICES, SRC_SERVICES);
    
    // Update config
    updateConfig('true');
    
    log(`\n✅ Đã bật chế độ MOCK! (${copied} files)`, 'green');
    log('\n📧 Account test:', 'cyan');
    log('   Email: admin@restaurant.com', 'reset');
    log('   Password: 123456', 'reset');
    log('\n⚠️  Dữ liệu là giả lập, không cần Backend', 'yellow');
}

/**
 * Enable Production mode
 */
function enableProd() {
    log('\n🔄 Đang chuyển sang chế độ PRODUCTION...', 'yellow');
    
    // Check if prod-versions exists
    if (!fs.existsSync(PROD_SERVICES)) {
        log('\n❌ Thư mục prod-versions không tồn tại!', 'red');
        return;
    }
    
    // Copy prod services
    log('\n📦 Copying production services:', 'cyan');
    const copied = copyServices(PROD_SERVICES, SRC_SERVICES);
    
    // Update config
    updateConfig('false');
    
    log(`\n✅ Đã bật chế độ PRODUCTION! (${copied} files)`, 'green');
    log('\n🔗 API sẽ kết nối đến Backend thực', 'cyan');
    log('   URL: Xem config.js -> API_BASE_URL', 'dim');
}

/**
 * Show current status
 */
function showStatus() {
    const mode = getCurrentMode();
    log('\n📊 Trạng thái hiện tại:', 'cyan');
    
    if (mode === 'mock') {
        log('   🎭 Chế độ: MOCK (dữ liệu giả lập)', 'yellow');
        log('   📧 Account: admin@restaurant.com / 123456', 'reset');
    } else if (mode === 'prod') {
        log('   🚀 Chế độ: PRODUCTION (Backend thực)', 'green');
    } else {
        log('   ❓ Chế độ: Không xác định', 'red');
    }
    
    log('\n📂 Folders:', 'cyan');
    log(`   mock-versions: ${fs.existsSync(MOCK_SERVICES) ? '✅' : '❌'}`, 'dim');
    log(`   prod-versions: ${fs.existsSync(PROD_SERVICES) ? '✅' : '❌'}`, 'dim');
}

/**
 * Show help
 */
function showHelp() {
    log('\n📖 Hướng dẫn sử dụng:', 'cyan');
    log('   node scripts/toggle-mock.js mock   - Bật chế độ Mock', 'reset');
    log('   node scripts/toggle-mock.js prod   - Bật chế độ Production', 'reset');
    log('   node scripts/toggle-mock.js status - Xem trạng thái hiện tại', 'reset');
    log('\n📦 Hoặc dùng npm scripts:', 'cyan');
    log('   npm run mock   - Bật Mock', 'reset');
    log('   npm run prod   - Bật Prod', 'reset');
}

// ==================== MAIN ====================
const command = process.argv[2];

switch (command) {
    case 'mock':
        enableMock();
        break;
    case 'prod':
        enableProd();
        break;
    case 'status':
        showStatus();
        break;
    default:
        showHelp();
        showStatus();
}

log('');
