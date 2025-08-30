fetch('http://localhost:3001/api/auth/signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@test.com',
    username: 'admin',
    password: 'Admin1234\!',
    name: 'Admin User'
  })
})
.then(res => res.json())
.then(data => console.log('Admin creation:', data))
.catch(err => console.error('Error:', err))
