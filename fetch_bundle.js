import https from 'https';

https.get('https://sindhe-vijay-leather-puppets.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/assets\/index-[a-zA-Z0-9_-]+\.js/);
    if (match) {
      console.log('BUNDLE:', match[0]);
    } else {
      console.log('NO BUNDLE FOUND');
    }
  });
});
