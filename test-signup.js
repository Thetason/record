fetch('http://localhost:3001/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@test.com',
    username: 'testuser',
    password: 'Test1234\!',
    name: 'Test User'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))
