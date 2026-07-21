import { useRef } from 'react';
import { Paperclip } from 'lucide-react';

const ALLOWED_TYPES = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/pdf': 'document',
};
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AttachmentButton({ onAdd, onError, disabled }) {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    for (const file of files) {
      const kind = ALLOWED_TYPES[file.type];
      if (!kind) {
        onError?.(`"${file.name}" no es un tipo de archivo permitido (solo imágenes o PDF).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        onError?.(`"${file.name}" pesa demasiado (máx. 8MB).`);
        continue;
      }
      try {
        const base64 = await readFileAsBase64(file);
        onAdd({
          id: crypto.randomUUID(),
          name: file.name,
          mediaType: file.type,
          kind,
          base64,
          previewUrl: kind === 'image' ? URL.createObjectURL(file) : null,
        });
      } catch {
        onError?.(`No se pudo leer "${file.name}".`);
      }
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(ALLOWED_TYPES).join(',')}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Adjuntar archivo"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
      >
        <Paperclip size={18} color="white" />
      </button>
    </>
  );
}
