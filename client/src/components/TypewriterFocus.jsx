import { useEffect, useState } from 'react';

const FRASES = ['Enfocate a captar.', 'Hablar con clientes.', 'Generar encuentros cara a cara.'];

const TYPE_SPEED = 55;
const DELETE_SPEED = 30;
const PAUSE_AFTER_TYPE = 1400;
const PAUSE_AFTER_DELETE = 300;

/**
 * TypewriterFocus — mensaje de foco en loop infinito, con efecto máquina de escribir
 * (tipea, pausa, borra, pasa a la siguiente frase). Puro CSS/JS, sin dependencias nuevas.
 */
export default function TypewriterFocus() {
  const [fraseIndex, setFraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const frase = FRASES[fraseIndex];
    let timeout;

    if (!deleting && text.length < frase.length) {
      timeout = setTimeout(() => setText(frase.slice(0, text.length + 1)), TYPE_SPEED);
    } else if (!deleting && text.length === frase.length) {
      timeout = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(frase.slice(0, text.length - 1)), DELETE_SPEED);
    } else {
      timeout = setTimeout(() => {
        setDeleting(false);
        setFraseIndex((i) => (i + 1) % FRASES.length);
      }, PAUSE_AFTER_DELETE);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, fraseIndex]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-center">
      <p className="font-display text-sm uppercase tracking-wide text-white">
        {text}
        <span className="ml-0.5 animate-pulse">|</span>
      </p>
    </div>
  );
}
