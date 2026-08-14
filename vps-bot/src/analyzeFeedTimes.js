import Parser from 'rss-parser';

const parser = new Parser();

async function analyzeHinduTimes() {
  try {
    const feed = await parser.parseURL('https://www.thehindu.com/opinion/editorial/feeder/default.rss');
    console.log(`==================================================`);
    console.log(`📰 The Hindu Editorial RSS Feed Timestamp Analysis`);
    console.log(`Total Articles in Feed: ${feed.items.length}`);
    console.log(`==================================================\n`);

    const items = feed.items.map(item => {
      const dateObj = new Date(item.pubDate || item.isoDate);
      const istDateStr = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });
      
      // Calculate IST Hour integer (0 to 23)
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false };
      const istHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(dateObj), 10);

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        istDateStr,
        istHour
      };
    });

    console.log('📌 Recent 15 Editorial Items & Publication Time (IST):\n');
    items.slice(0, 15).forEach((item, index) => {
      console.log(`${index + 1}. [${item.istDateStr}] (Hour: ${item.istHour}:00 IST)`);
      console.log(`   Title: "${item.title}"`);
    });

    // Histogram of hours
    const hourHistogram = {};
    for (let i = 0; i < 24; i++) hourHistogram[i] = 0;

    items.forEach(item => {
      if (!isNaN(item.istHour)) {
        hourHistogram[item.istHour] = (hourHistogram[item.istHour] || 0) + 1;
      }
    });

    console.log('\n==================================================');
    console.log('📊 Publication Frequency by Hour of Day (IST):');
    console.log('==================================================');
    Object.keys(hourHistogram).forEach(hour => {
      const hStr = String(hour).padStart(2, '0');
      const count = hourHistogram[hour];
      const bar = '█'.repeat(count);
      console.log(`${hStr}:00 IST | ${count.toString().padStart(2, ' ')} articles | ${bar}`);
    });

  } catch (err) {
    console.error('Error analyzing RSS feed:', err.message);
  }
}

analyzeHinduTimes();
