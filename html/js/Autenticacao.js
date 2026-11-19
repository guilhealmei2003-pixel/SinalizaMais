(() => {
    const USERS_KEY = 'sinaliza_usuarios_v1';
    const SESSION_KEY = 'sinaliza_sessao_v1';
    const ITERATIONS = 210000;
    const encoder = new TextEncoder();

    const readUsers = () => {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    };

    const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const toBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));

    async function hashPassword(password, salt, iterations = ITERATIONS) {
        if (!crypto?.subtle) throw new Error('Abra o site em localhost ou HTTPS para usar o cadastro seguro.');
        const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, key, 256);
        return toBase64(bits);
    }


    function safeEqual(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return result === 0;
    }

    function showMessage(message, success = false) {
        const output = document.getElementById('mensagem');
        output.textContent = message;
        output.classList.toggle('sucesso', success);
        output.classList.toggle('erro', !success);
    }

    function validateEmail(email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) return 'Digite um e-mail válido, por exemplo: nome@exemplo.com.';
        return '';
    }

    function markInvalid(input) {
        input.classList.add('campo-invalido');
        input.setAttribute('aria-invalid', 'true');
    }

    function clearInvalid(input) {
        input.classList.remove('campo-invalido');
        input.removeAttribute('aria-invalid');
    }

    function clearLoginMessage() {
        const output = document.getElementById('mensagem');
        output.textContent = '';
        output.classList.remove('sucesso', 'erro');
    }

    document.querySelectorAll('[data-toggle-password]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';
            button.textContent = visible ? 'Ocultar' : 'Mostrar';
            button.setAttribute('aria-label', `${visible ? 'Ocultar' : 'Mostrar'} senha`);
        });
    });

    const emailField = document.getElementById('email');
    const emailFeedback = document.getElementById('email-feedback');
    if (emailField && emailFeedback) {
        const checkEmailFormat = () => {
            const email = emailField.value.trim().toLowerCase();
            if (!email) {
                emailFeedback.textContent = '';
                emailFeedback.classList.remove('sucesso', 'erro');
                return;
            }
            const formatError = validateEmail(email);
            const isLogin = Boolean(document.getElementById('form-login'));
            if (isLogin) {
                emailFeedback.textContent = formatError ? '' : 'Formato de e-mail correto.';
                emailFeedback.classList.toggle('erro', Boolean(formatError));
                emailFeedback.classList.toggle('sucesso', !formatError);
                if (formatError) markInvalid(emailField);
                else clearInvalid(emailField);
                return;
            }
            const error = formatError;
            emailFeedback.textContent = error || 'Formato de e-mail correto.';
            emailFeedback.classList.toggle('erro', Boolean(error));
            emailFeedback.classList.toggle('sucesso', !error);
        };
        emailField.addEventListener('blur', checkEmailFormat);
        emailField.addEventListener('input', () => {
            if (emailFeedback.textContent) checkEmailFormat();
        });
    }

    const registration = document.getElementById('form-cadastro');
    if (registration) registration.addEventListener('submit', async event => {
        event.preventDefault();
        const name = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('senha').value;
        const confirmation = document.getElementById('confirmar-senha').value;

        if (name.length < 2) return showMessage('Digite seu nome completo.');
        const emailError = validateEmail(email);
        if (emailError) return showMessage(emailError);
        if (password.length < 8) return showMessage('A senha precisa ter pelo menos 8 caracteres.');
        if (password !== confirmation) return showMessage('As senhas não são iguais.');
        const users = readUsers();
        if (users.some(user => user.email === email)) return showMessage('Já existe uma conta cadastrada com esse e-mail.');

        const submit = registration.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Criando conta…';
        try {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const passwordHash = await hashPassword(password, salt);
            users.push({name, email, salt: toBase64(salt), passwordHash, iterations: ITERATIONS});
            saveUsers(users);
            registration.reset();
            showMessage('Conta criada! Agora você já pode entrar.', true);
            window.setTimeout(() => { window.location.href = 'Login.html'; }, 1200);
        } catch (error) {
            showMessage(error.message || 'Não foi possível criar a conta. Tente novamente.');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Criar conta';
        }
    });

    const recovery = document.getElementById('form-recuperacao');
    if (recovery) recovery.addEventListener('submit', async event => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('senha').value;
        const confirmation = document.getElementById('confirmar-senha').value;
        const emailError = validateEmail(email);
        if (emailError) return showMessage(emailError);
        if (password.length < 8) return showMessage('A nova senha precisa ter pelo menos 8 caracteres.');
        if (password !== confirmation) return showMessage('As senhas não são iguais.');

        const users = readUsers();
        const userIndex = users.findIndex(user => user.email === email);
        if (userIndex < 0) return showMessage('Não encontramos uma conta com esse e-mail neste navegador.');

        const submit = recovery.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Salvando…';
        try {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const passwordHash = await hashPassword(password, salt);
            users[userIndex].salt = toBase64(salt);
            users[userIndex].passwordHash = passwordHash;
            users[userIndex].iterations = ITERATIONS;
            saveUsers(users);
            recovery.reset();
            showMessage('Senha atualizada. Você já pode entrar com a nova senha.', true);
            window.setTimeout(() => { window.location.href = 'Login.html'; }, 1400);
        } catch (error) {
            showMessage(error.message || 'Não foi possível atualizar a senha. Tente novamente.');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Salvar nova senha';
        }
    });

    const login = document.getElementById('form-login');
    if (login) login.addEventListener('submit', async event => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('senha').value;
        const emailError = validateEmail(email);
        if (emailError) {
            markInvalid(document.getElementById('email'));
            clearLoginMessage();
            return;
        }
        const user = readUsers().find(item => item.email === email);
        if (!user) {
            markInvalid(document.getElementById('email'));
            markInvalid(document.getElementById('senha'));
            clearLoginMessage();
            return;
        }

        const submit = login.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Verificando…';
        try {
            const salt = Uint8Array.from(atob(user.salt), char => char.charCodeAt(0));
            const actualHash = await hashPassword(password, salt);
            if (actualHash !== user.passwordHash) {
                markInvalid(document.getElementById('email'));
                markInvalid(document.getElementById('senha'));
                clearLoginMessage();
                return;
            }
            clearInvalid(document.getElementById('email'));
            clearInvalid(document.getElementById('senha'));
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({name: user.name, email: user.email}));
            showMessage(`Conta verificada. Login realizado com sucesso. Bem-vindo(a), ${user.name}!`, true);
            window.setTimeout(() => { window.location.href = 'Sinaliza.html'; }, 800);
        } catch (error) {
            showMessage(error.message || 'Não foi possível entrar. Tente novamente.');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Entrar';
        }
    });

    const passwordField = document.querySelector('#form-login #senha');
    if (passwordField) passwordField.addEventListener('input', () => clearInvalid(passwordField));
    if (emailField && document.getElementById('form-login')) {
        emailField.addEventListener('input', () => clearInvalid(emailField));
    }
})();
