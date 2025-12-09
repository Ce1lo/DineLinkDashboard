/**
 * Script to replace Lucide icons with Font Awesome icons in all .hbs files
 */
const fs = require('fs');
const path = require('path');

// Icon mapping: Lucide icon name -> Font Awesome class
const iconMap = {
    // Dashboard & Layout
    'layout-dashboard': 'fa-solid fa-gauge-high',
    'gauge': 'fa-solid fa-gauge-high',
    
    // Navigation
    'calendar-check': 'fa-solid fa-calendar-check',
    'calendar': 'fa-regular fa-calendar',
    'grid-3x3': 'fa-solid fa-table-cells',
    'image': 'fa-solid fa-image',
    'images': 'fa-solid fa-images',
    'star': 'fa-solid fa-star',
    'bell': 'fa-solid fa-bell',
    'building-2': 'fa-solid fa-building',
    'building': 'fa-solid fa-building',
    'users': 'fa-solid fa-users',
    'user': 'fa-solid fa-user',
    'user-cog': 'fa-solid fa-user-gear',
    'user-plus': 'fa-solid fa-user-plus',
    'log-out': 'fa-solid fa-right-from-bracket',
    'settings': 'fa-solid fa-gear',
    'gear': 'fa-solid fa-gear',
    
    // Actions
    'check': 'fa-solid fa-check',
    'check-circle': 'fa-solid fa-circle-check',
    'x': 'fa-solid fa-xmark',
    'x-circle': 'fa-solid fa-circle-xmark',
    'plus': 'fa-solid fa-plus',
    'plus-circle': 'fa-solid fa-circle-plus',
    'minus': 'fa-solid fa-minus',
    'edit': 'fa-solid fa-pen',
    'pencil': 'fa-solid fa-pencil',
    'trash': 'fa-solid fa-trash',
    'trash-2': 'fa-solid fa-trash',
    'eye': 'fa-solid fa-eye',
    'eye-off': 'fa-solid fa-eye-slash',
    'search': 'fa-solid fa-magnifying-glass',
    'filter': 'fa-solid fa-filter',
    'refresh-cw': 'fa-solid fa-rotate',
    'upload': 'fa-solid fa-upload',
    'download': 'fa-solid fa-download',
    'send': 'fa-solid fa-paper-plane',
    'save': 'fa-solid fa-floppy-disk',
    
    // Arrows & Navigation
    'arrow-left': 'fa-solid fa-arrow-left',
    'arrow-right': 'fa-solid fa-arrow-right',
    'arrow-up': 'fa-solid fa-arrow-up',
    'arrow-down': 'fa-solid fa-arrow-down',
    'chevron-left': 'fa-solid fa-chevron-left',
    'chevron-right': 'fa-solid fa-chevron-right',
    'chevron-up': 'fa-solid fa-chevron-up',
    'chevron-down': 'fa-solid fa-chevron-down',
    'external-link': 'fa-solid fa-arrow-up-right-from-square',
    
    // Data & Content
    'bar-chart-3': 'fa-solid fa-chart-column',
    'bar-chart': 'fa-solid fa-chart-bar',
    'trending-up': 'fa-solid fa-arrow-trend-up',
    'trending-down': 'fa-solid fa-arrow-trend-down',
    'clock': 'fa-solid fa-clock',
    'map-pin': 'fa-solid fa-location-dot',
    'phone': 'fa-solid fa-phone',
    'mail': 'fa-solid fa-envelope',
    'lock': 'fa-solid fa-lock',
    'unlock': 'fa-solid fa-unlock',
    'key': 'fa-solid fa-key',
    'info': 'fa-solid fa-circle-info',
    'alert-circle': 'fa-solid fa-circle-exclamation',
    'alert-triangle': 'fa-solid fa-triangle-exclamation',
    'message-square': 'fa-solid fa-comment',
    'message-circle': 'fa-regular fa-comment',
    'reply': 'fa-solid fa-reply',
    
    // UI Elements
    'menu': 'fa-solid fa-bars',
    'more-horizontal': 'fa-solid fa-ellipsis',
    'more-vertical': 'fa-solid fa-ellipsis-vertical',
    'crown': 'fa-solid fa-crown',
    'briefcase': 'fa-solid fa-briefcase',
    'inbox': 'fa-solid fa-inbox',
    'camera': 'fa-solid fa-camera',
    'folder': 'fa-solid fa-folder',
    'utensils': 'fa-solid fa-utensils',
    'utensils-crossed': 'fa-solid fa-utensils',
    
    // Fallback icons
    'circle': 'fa-solid fa-circle',
    'square': 'fa-solid fa-square',
};

function getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (item.endsWith('.hbs')) {
            files.push(fullPath);
        }
    }
    return files;
}

function replaceIcons(content) {
    // Replace <i data-lucide="icon-name" class="..."></i> with <i class="fa-..."></i>
    return content.replace(/<i\s+data-lucide="([^"]+)"[^>]*><\/i>/g, (match, iconName) => {
        const faClass = iconMap[iconName] || 'fa-solid fa-circle';
        return `<i class="${faClass}"></i>`;
    });
}

function removeCreateIconsCalls(content) {
    // Remove lucide.createIcons() calls
    return content.replace(/if\s*\(\s*typeof\s+lucide\s*!==\s*'undefined'\s*\)\s*lucide\.createIcons\(\);?/g, '');
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const templatesDir = path.join(projectRoot, 'templates');
const files = getAllFiles(templatesDir);

let totalReplacements = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    content = replaceIcons(content);
    content = removeCreateIconsCalls(content);
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        const matched = (originalContent.match(/data-lucide/g) || []).length;
        totalReplacements += matched;
        console.log(`Updated: ${path.relative(process.cwd(), file)} (${matched} icons)`);
    }
}

console.log(`\nTotal icons replaced: ${totalReplacements}`);
console.log('Done!');
