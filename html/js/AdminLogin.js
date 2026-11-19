// Apenas alterna a visibilidade da senha; a autenticação é feita pelo PHP.
document.querySelectorAll('[data-toggle-password]').forEach(button => {
  button.addEventListener('click', () => {
    const field = document.getElementById(button.dataset.togglePassword);
    if (!field) return;
    const showing = field.type === 'password';
    field.type = showing ? 'text' : 'password';
    button.textContent = showing ? 'Ocultar' : 'Mostrar';
  });
});
