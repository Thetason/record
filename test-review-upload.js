fetch('http://localhost:3001/api/reviews', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    platform: '네이버',
    businessName: '테스트샵',
    content: '정말 좋았습니다\! 서비스가 최고예요.',
    rating: 5,
    author: '김**',
    reviewDate: new Date().toISOString(),
    userId: 'cmexzf3ll0000ebn4vhfgyvr6' // 방금 생성한 사용자 ID
  })
})
.then(res => res.json())
.then(data => console.log('Review Upload Response:', data))
.catch(err => console.error('Error:', err))
