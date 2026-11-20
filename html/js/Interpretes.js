(() => {
    const KEY = 'sinaliza_interpretes_v1';
    const SESSION = 'sinaliza_interprete_sessao_v2';
    const ITERATIONS = 210000;
    const encoder = new TextEncoder();

    const api=async(path,options={})=>{const r=await fetch('../backend/api/'+path,{credentials:'same-origin',...options});let d;try{d=await r.json()}catch{throw Error('Resposta inválida do servidor. Confirme a configuração PHP/MySQL.')}if(!r.ok||!d.ok)throw Error(d.erro||'Erro na comunicação com o servidor');return d;};
    const mutation=(data)=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
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

        try {
            data.foto_url=await imageFileToDataUrl(photoFile);
            await api('interpretes.php',mutation(data));
            cadastro.reset();const preview=document.getElementById('interprete-foto-preview');if(preview)preview.replaceChildren();
            message('mensagem-interprete','Cadastro salvo no banco de dados! Redirecionando para o login...',true);
            setTimeout(()=>{window.location.href='LoginInterprete.html?cadastro=sucesso'},900);
        }catch(error){message('mensagem-interprete',error.message||'Não foi possível cadastrar.');}
    });

    const login=document.getElementById('form-login-interprete');
    if(login){
      api('interprete_sessao.php').then(()=>{window.location.href='PerfilInterprete.html'}).catch(()=>{});
      login.addEventListener('submit',async e=>{
        e.preventDefault();const email=document.getElementById('login-interprete-email').value.trim(),senha=document.getElementById('login-interprete-senha').value;
        try{await api('interprete_sessao.php',mutation({email,senha}));message('mensagem-login-interprete','Login realizado. Abrindo seu perfil...',true);window.location.href='PerfilInterprete.html';}
        catch(err){message('mensagem-login-interprete',err.message)}
      });
    }

    document.getElementById('abrir-login-interprete')?.addEventListener('click', () => {
        document.getElementById('login-interprete-email')?.focus();
    });

    async function render(){
        const box=document.getElementById('interpretes-cadastrados');if(!box)return;
        try{const interpretes=(await api('interpretes.php')).interpretes;
            if(!interpretes.length){box.innerHTML='<p class="lista-vazia">Ainda não há intérpretes aprovados.</p>';return;}
            box.innerHTML=interpretes.map(item=>`<article class="perfil-interprete"><div>${item.foto_url?`<img src="${escapeHtml(item.foto_url)}" alt="Foto de ${escapeHtml(item.nome)}" style="max-width:100px;border-radius:12px;margin-bottom:10px;">`:''}<h3>${escapeHtml(item.nome)}</h3><p><strong>Atuação:</strong> ${escapeHtml(item.atuacao)}</p><p><strong>Região:</strong> ${escapeHtml(item.cidade)}</p><p><strong>Disponibilidade:</strong> ${escapeHtml(item.disponibilidade)}</p></div><div class="contato-interprete"><a class="botao botao-claro" href="https://wa.me/55${String(item.telefone).replace(/\D/g,'')}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="botao" href="mailto:${encodeURIComponent(item.email)}">E-mail</a></div></article>`).join('');
        }catch(err){box.textContent='Erro ao carregar intérpretes: '+err.message;}
    }
    function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
    render();
})();
