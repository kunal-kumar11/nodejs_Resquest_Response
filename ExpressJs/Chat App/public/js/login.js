
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const credentials = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    try {
      const res = await axios.post('/api/auth/login', credentials);
      alert(res.data.message);

      const token = res.data.token;
      localStorage.setItem('token', token); // Store token
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Optional

      // 🔐 Decode JWT and store username separately
  const decoded = JSON.parse(atob(token.split('.')[1]));
console.log("Decoded JWT payload:", decoded);  // Check the whole payload object
localStorage.setItem('username', decoded.username); 

      window.location.href = '/chat.html'; // Redirect to group chat page
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  });
