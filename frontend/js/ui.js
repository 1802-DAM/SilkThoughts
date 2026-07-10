function mostrarMensaje(elementId, texto, tipo = 'info') {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  el.style.display = 'block';
}

function limpiarMensaje(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = '';
  el.className = 'mensaje';
  el.style.display = 'none';
}