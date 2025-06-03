
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
      };

      try {
        const res = await axios.post('/api/auth/register', userData);
        alert(res.data.message);
        window.location.href = '/login.html';
      } catch (err) {
        console.log(err)

        alert(err.response?.data?.error);
      }
    });
