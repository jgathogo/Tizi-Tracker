// Tizi Tracker Data Recovery Script
// Copy and paste this into your browser console (on your phone or desktop)

console.log('🔍 Tizi Tracker Data Recovery');
console.log('==============================\n');

// Check both possible keys
const key1 = 'tizi_tracker_data';
const key2 = 'powerlifts_data';

const data1 = localStorage.getItem(key1);
const data2 = localStorage.getItem(key2);

console.log(`✅ ${key1}:`, data1 ? 'FOUND (' + (data1.length / 1024).toFixed(2) + ' KB)' : 'NOT FOUND');
console.log(`✅ ${key2}:`, data2 ? 'FOUND (' + (data2.length / 1024).toFixed(2) + ' KB)' : 'NOT FOUND');

if (data1 || data2) {
  const data = data1 || data2;
  try {
    const parsed = JSON.parse(data);
    console.log('\n📊 Data Summary:');
    console.log('  - History entries:', parsed.history?.length || 0);
    console.log('  - Current weights:', Object.keys(parsed.currentWeights || {}).length);
    console.log('  - Next workout:', parsed.nextWorkout || 'N/A');
    console.log('  - Unit:', parsed.unit || 'N/A');
    
    if (parsed.history && parsed.history.length > 0) {
      console.log('\n📅 Recent Workouts:');
      parsed.history.slice(0, 5).forEach((w, i) => {
        console.log(`  ${i+1}. ${w.date} - ${w.type} (${w.exercises?.length || 0} exercises)`);
      });
    }
    
    // Create download
    console.log('\n💾 Creating backup file...');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tizi_recovery_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup file downloaded! Check your Downloads folder.');
    console.log('\n📋 To restore: Go to Settings → Import Data and select the downloaded file.');
    
  } catch (e) {
    console.error('❌ Error parsing data:', e);
    console.log('\n⚠️ Data exists but may be corrupted. Try exporting manually.');
  }
} else {
  console.log('\n❌ No data found in localStorage.');
  console.log('   This could mean:');
  console.log('   1. Data was cleared (unlikely)');
  console.log('   2. You\'re on a different domain/URL');
  console.log('   3. Browser storage was cleared');
}

console.log('\n==============================');
