/**
 * Soft Delete / Restore Mock (ES6 Module Version)
 * 
 * Usage:
 *   node scripts/manage-mock.js backup   - Backup mock to .bak folder (soft delete)
 *   node scripts/manage-mock.js restore  - Restore mock from .bak folder
 *   node scripts/manage-mock.js status   - Show current status
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const bakDir = path.join(rootDir, '.bak');

// Files/folders to backup
const mockItems = [
    { src: 'src/mock', type: 'folder' },
    { src: 'src/services/mock-versions', type: 'folder' }
];

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

function deleteRecursive(target) {
    if (!fs.existsSync(target)) return;
    
    if (fs.statSync(target).isDirectory()) {
        fs.readdirSync(target).forEach(file => {
            deleteRecursive(path.join(target, file));
        });
        fs.rmdirSync(target);
    } else {
        fs.unlinkSync(target);
    }
}

function backupMock() {
    console.log('📦 Backing up mock files to .bak folder...\n');
    
    // Check if mock exists
    const mockDir = path.join(rootDir, 'src/mock');
    if (!fs.existsSync(mockDir)) {
        console.log('❌ No mock folder found. Already backed up?');
        return;
    }
    
    // Create .bak folder
    fs.mkdirSync(bakDir, { recursive: true });
    
    let backedUp = 0;
    
    mockItems.forEach(item => {
        const srcPath = path.join(rootDir, item.src);
        const destPath = path.join(bakDir, item.src);
        
        if (fs.existsSync(srcPath)) {
            copyRecursive(srcPath, destPath);
            deleteRecursive(srcPath);
            console.log(`✅ ${item.src}`);
            backedUp++;
        } else {
            console.log(`⏭️  ${item.src} (not found, skipped)`);
        }
    });
    
    // Copy prod-versions to services (clean production)
    const prodVersions = path.join(rootDir, 'src/services/prod-versions');
    const services = path.join(rootDir, 'src/services');
    
    if (fs.existsSync(prodVersions)) {
        fs.readdirSync(prodVersions).forEach(file => {
            if (file.endsWith('.js')) {
                fs.copyFileSync(
                    path.join(prodVersions, file),
                    path.join(services, file)
                );
            }
        });
        console.log(`✅ Copied prod-versions to services`);
    }
    
    // Update config to production mode
    const configPath = path.join(rootDir, 'src/config.js');
    let config = fs.readFileSync(configPath, 'utf8');
    config = config.replace(/USE_MOCK:\s*true/, 'USE_MOCK: false');
    fs.writeFileSync(configPath, config);
    console.log(`✅ Updated config.js (USE_MOCK: false)`);
    
    console.log(`\n🎉 Backup complete! ${backedUp} items moved to .bak/`);
    console.log('📦 Project is now in clean production mode.');
    console.log('\n💡 To restore mock: node scripts/manage-mock.js restore');
}

function restoreMock() {
    console.log('♻️  Restoring mock files from .bak folder...\n');
    
    if (!fs.existsSync(bakDir)) {
        console.log('❌ No backup found. Cannot restore.');
        return;
    }
    
    let restored = 0;
    
    // Restore all items
    mockItems.forEach(item => {
        const bakPath = path.join(bakDir, item.src);
        const destPath = path.join(rootDir, item.src);
        
        if (fs.existsSync(bakPath)) {
            copyRecursive(bakPath, destPath);
            console.log(`✅ ${item.src}`);
            restored++;
        }
    });
    
    // Delete .bak folder
    deleteRecursive(bakDir);
    
    // Switch to mock mode
    const mockVersions = path.join(rootDir, 'src/services/mock-versions');
    const services = path.join(rootDir, 'src/services');
    
    if (fs.existsSync(mockVersions)) {
        fs.readdirSync(mockVersions).forEach(file => {
            if (file.endsWith('.js')) {
                fs.copyFileSync(
                    path.join(mockVersions, file),
                    path.join(services, file)
                );
            }
        });
    }
    
    // Update config
    const configPath = path.join(rootDir, 'src/config.js');
    let config = fs.readFileSync(configPath, 'utf8');
    config = config.replace(/USE_MOCK:\s*false/, 'USE_MOCK: true');
    fs.writeFileSync(configPath, config);
    
    console.log(`\n🎉 Restore complete! ${restored} items restored.`);
    console.log('🧪 Mock mode is enabled. Run: npm run dev');
}

function showStatus() {
    const hasBak = fs.existsSync(bakDir);
    const hasMock = fs.existsSync(path.join(rootDir, 'src/mock'));
    const hasMockVersions = fs.existsSync(path.join(rootDir, 'src/services/mock-versions'));
    const hasProdVersions = fs.existsSync(path.join(rootDir, 'src/services/prod-versions'));
    
    console.log('📊 Mock Status\n');
    
    console.log('📂 Folders:');
    console.log(`   src/mock:          ${hasMock ? '✅' : '❌'}`);
    console.log(`   mock-versions:     ${hasMockVersions ? '✅' : '❌'}`);
    console.log(`   prod-versions:     ${hasProdVersions ? '✅' : '❌'}`);
    console.log(`   .bak (backup):     ${hasBak ? '✅' : '❌'}`);
    
    if (hasMock && hasMockVersions) {
        console.log('\nStatus: 🧪 MOCK AVAILABLE');
        console.log('\nCommands:');
        console.log('  npm run mock        - Switch to mock mode');
        console.log('  npm run prod        - Switch to production mode');
        console.log('\nTo soft delete mock:');
        console.log('  node scripts/manage-mock.js backup');
    } else if (hasBak) {
        console.log('\nStatus: 🚀 PRODUCTION (mock backed up)');
        console.log('\nMock files are in .bak/ folder.');
        console.log('\nTo restore mock:');
        console.log('  node scripts/manage-mock.js restore');
    } else {
        console.log('\nStatus: 🚀 PRODUCTION (no mock)');
    }
}

// Main
const arg = process.argv[2];

switch (arg) {
    case 'backup':
        backupMock();
        break;
    case 'restore':
        restoreMock();
        break;
    default:
        showStatus();
}
