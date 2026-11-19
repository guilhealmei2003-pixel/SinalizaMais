(() => {
    const KEY = 'sinaliza_interpretes_v1';
    const SESSION = 'sinaliza_interprete_sessao_v2';
    const ITERATIONS = 210000;
    const encoder = new TextEncoder();

    const read = () => {
        try {
            const value = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(value) ? value : [];
        } catch { return []; }
    };
    const save = value => localStorage.setItem(KEY, JSON.stringify(value));
    const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));

    async function hash(password, salt, iterations = ITERATIONS) {
        const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations, hash:'SHA-256'}, key, 256);
        return b64(bits);
    }


    function safeEqual(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return result === 0;
    }

    async function imageFileToDataUrl(file) {
        if (!file) return '';
        if (!file.type || !file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem válido.');
        if (file.size > 12 * 1024 * 1024) throw new Error('A imagem deve ter até 12 MB.');
        const source = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
            reader.readAsDataURL(file);
        });
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Não foi possível abrir essa imagem. Tente outro arquivo.'));
            image.src = source;
        });
        const max = 600, scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.78);
    }

    const photoInput = document.getElementById('interprete-foto');
    if (photoInput) photoInput.addEventListener('change', async () => {
        const preview = document.getElementById('interprete-foto-preview');
        if (!preview) return;
        preview.replaceChildren();
        if (!photoInput.files || !photoInput.files[0]) return;
        try {
            const dataUrl = await imageFileToDataUrl(photoInput.files[0]);
            const img = document.createElement('img');
            img.src = dataUrl; img.alt = 'Pré-visualização da foto selecionada';
            img.style.cssText = 'display:block;max-width:140px;max-height:140px;object-fit:cover;border-radius:12px;margin:10px 0;';
            preview.appendChild(img);
        } catch (error) { message('mensagem-interprete', error.message); photoInput.value = ''; }
    });

    const message = (id, text, success=false) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
        el.classList.toggle('sucesso', success);
        el.classList.toggle('erro', !success);
    };

    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePassword);
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';
            btn.textContent = visible ? 'Ocultar' : 'Mostrar';
        });
    });

    const cadastro = document.getElementById('form-interprete');
    if (cadastro) cadastro.addEventListener('submit', async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(cadastro).entries());
        const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;
        data.nome = data.nome.trim();
        data.email = data.email.trim().toLowerCase();
        data.telefone = data.telefone.trim();
        data.cidade = data.cidade.trim();
        data.atuacao = data.atuacao.trim();
        data.disponibilidade = data.disponibilidade.trim();

        if (data.nome.length < 2 || !data.telefone || !data.cidade || !data.atuacao || !data.disponibilidade)
            return message('mensagem-interprete', 'Preencha todos os campos do cadastro.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
            return message('mensagem-interprete', 'Digite um e-mail válido.');
        if (data.senha.length < 8)
            return message('mensagem-interprete', 'A senha precisa ter pelo menos 8 caracteres.');

        const interpretes = read();
        if (interpretes.some(item => item.email === data.email))
            return message('mensagem-interprete', 'Já existe um cadastro de intérprete com este e-mail.');

        try {
            data.foto_url = await imageFileToDataUrl(photoFile);
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const passwordHash = await hash(data.senha, salt);
            interpretes.push({
                nome:data.nome, email:data.email, telefone:data.telefone,
                cidade:data.cidade, atuacao:data.atuacao,
                disponibilidade:data.disponibilidade, modalidade:data.modalidade || 'Presencial', certificacao:data.certificacao || '', foto_url:data.foto_url || '',
                salt:b64(salt), passwordHash, iterations:ITERATIONS,
                ativo:true,
                status:'pendente',
                motivo_status:'',
                criado_em:new Date().toISOString(),
                status_atualizado_em:new Date().toISOString()
            });
            try { save(interpretes); } catch (storageError) { throw new Error('Não foi possível salvar os dados neste navegador. Tente uma imagem menor ou libere espaço no armazenamento.'); }
            cadastro.reset();
            const preview = document.getElementById('interprete-foto-preview'); if (preview) preview.replaceChildren();
            message('mensagem-interprete', 'Cadastro realizado com sucesso! Redirecionando para o login...', true);
            setTimeout(() => { window.location.href = 'LoginInterprete.html?cadastro=sucesso'; }, 900);
        } catch (error) {
            message('mensagem-interprete', error.message || 'Não foi possível realizar o cadastro.');
        }
    });

    const login = document.getElementById('form-login-interprete');
    if (login && localStorage.getItem(SESSION)) { window.location.href = 'PerfilInterprete.html'; return; }
    if (login) login.addEventListener('submit', async event => {
        event.preventDefault();
        const email = document.getElementById('login-interprete-email').value.trim().toLowerCase();
        const senha = document.getElementById('login-interprete-senha').value;
        const user = read().find(item => item.email === email);
        if (!user) return message('mensagem-login-interprete', 'E-mail ou senha incorretos.');
        try {
            const salt = Uint8Array.from(atob(user.salt), c => c.charCodeAt(0));
            const actual = await hash(senha, salt, Number(user.iterations) || ITERATIONS);
            if (!safeEqual(actual, user.passwordHash)) return message('mensagem-login-interprete', 'E-mail ou senha incorretos.');
            localStorage.setItem(SESSION, JSON.stringify({email:user.email, nome:user.nome}));
            const statusText = ({pendente:'Seu cadastro está aguardando análise do administrador.', aprovado:'Seu cadastro foi aprovado.', reprovado:'Seu cadastro foi recusado. Você poderá consultar o motivo no seu perfil.', bloqueado:'Seu acesso está bloqueado pela administração. Consulte o motivo no seu perfil.'})[user.status || 'pendente'];
            message('mensagem-login-interprete', `Login realizado. ${statusText} Redirecionando...`, true);
            setTimeout(() => { window.location.href = 'PerfilInterprete.html'; }, 900);
        } catch {
            message('mensagem-login-interprete', 'Não foi possível realizar o login.');
        }
    });

    document.getElementById('abrir-login-interprete')?.addEventListener('click', () => {
        document.getElementById('login-interprete-email')?.focus();
    });

    function render() {
        const box = document.getElementById('interpretes-cadastrados');
        if (!box) return;
        const interpretes = read().filter(item => item.ativo !== false && (!item.status || item.status === 'aprovado'));
        if (!interpretes.length) {
            box.innerHTML = '<p class="lista-vazia">Ainda não há intérpretes cadastrados neste navegador.</p>';
            return;
        }
        box.innerHTML = interpretes.map(item => `
            <article class="perfil-interprete">
                <div>${item.foto_url ? `<img src="${escapeHtml(item.foto_url)}" alt="Foto de ${escapeHtml(item.nome)}" style="max-width:100px;border-radius:12px;margin-bottom:10px;">` : ''}
                    <h3>${escapeHtml(item.nome)}</h3>
                    <p><strong>Atuação:</strong> ${escapeHtml(item.atuacao)}</p>
                    <p><strong>Região:</strong> ${escapeHtml(item.cidade)}</p>
                    <p><strong>Disponibilidade:</strong> ${escapeHtml(item.disponibilidade)}</p><p><strong>Modalidade:</strong> ${escapeHtml(item.modalidade || 'Presencial')}</p>${item.certificacao ? `<p><strong>Formação:</strong> ${escapeHtml(item.certificacao)}</p>` : ''}
                </div>
                <div class="contato-interprete">
                    <a class="botao botao-claro" href="https://wa.me/55${item.telefone.replace(/\D/g,'')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a class="botao" href="mailto:${encodeURIComponent(item.email)}">E-mail</a>
                    <p>${escapeHtml(item.telefone)}</p>
                </div>
            </article>
        `).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
    }

    render();
})();