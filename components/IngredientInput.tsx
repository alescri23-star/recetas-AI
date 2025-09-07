
import React, { useState, useEffect, useRef } from 'react';
import type { FilterOption } from '../types';

// Define interfaces for SpeechRecognition to avoid TypeScript errors in environments
// where the DOM lib might not be fully configured for it.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface IngredientInputProps {
  ingredients: string;
  // FIX: Correctly type `setIngredients` to allow function updates for state.
  setIngredients: React.Dispatch<React.SetStateAction<string>>;
  onGenerate: (ingredients: string, filters: FilterOption[]) => void;
  onOpenCamera: () => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients, onGenerate, onOpenCamera }) => {
  const [dietFilters, setDietFilters] = useState<FilterOption[]>([
    { id: 'vegano', label: 'Vegano', checked: false },
    { id: 'vegetariano', label: 'Vegetariano', checked: false },
    { id: 'sin-gluten', label: 'Sin Gluten', checked: false },
    { id: 'no-me-complico', label: 'No me complico', checked: false },
  ]);
  
  const [miscFilters, setMiscFilters] = useState<FilterOption[]>([
    { id: 'rapido', label: 'Rápido (< 30 min)', checked: false },
    { id: 'economico', label: 'Económico', checked: false },
    { id: 'saludable', label: 'Saludable', checked: false },
    { id: 'gourmet', label: 'Gourmet', checked: false },
  ]);

  const [difficultyFilters, setDifficultyFilters] = useState<FilterOption[]>([
    { id: 'facil', label: 'Fácil', checked: false },
    { id: 'intermedio', label: 'Intermedio', checked: false },
    { id: 'dificil', label: 'Difícil', checked: false },
  ]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setIngredients(prev => (prev ? `${prev}, ${transcript}` : transcript));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [setIngredients]);

  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("El reconocimiento de voz no es compatible o no se han otorgado los permisos.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        alert("No se pudo iniciar el reconocimiento de voz. Asegúrate de que el micrófono esté permitido.");
      }
    }
  };


  const handleToggleFilter = (setter: React.Dispatch<React.SetStateAction<FilterOption[]>>, id: string) => {
    setter(prevFilters =>
      prevFilters.map(filter =>
        filter.id === id ? { ...filter, checked: !filter.checked } : filter
      )
    );
  };

  const handleSingleSelectChange = (setter: React.Dispatch<React.SetStateAction<FilterOption[]>>, id: string) => {
    setter(prevFilters =>
      prevFilters.map(filter => {
        if (filter.id === id) return { ...filter, checked: !filter.checked }; // Toggle the clicked one
        return { ...filter, checked: false }; // Uncheck all others
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allFilters = [...dietFilters, ...miscFilters, ...difficultyFilters];
    onGenerate(ingredients, allFilters);
  };

  const renderFilterButtons = (filters: FilterOption[], handler: (id: string) => void) => (
    <div className="flex flex-wrap gap-3">
      {filters.map(filter => (
        <button
          type="button"
          key={filter.id}
          onClick={() => handler(filter.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
            filter.checked
              ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-[#D4AF37]'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full animate-fade-in">
      {/* Form Section */}
      <div className="w-full p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
            Homsent Chef AI
          </h2>
          <p className="text-md md:text-lg text-gray-300 mt-1">
            Tu asistente culinario inteligente.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="ingredients" className="block text-lg font-semibold mb-2 text-[#D4AF37]">
            Ingredientes
          </label>
          <p className="text-gray-400 mb-4">Escribe tus ingredientes, o usa la cámara o el micrófono para añadirlos.</p>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ej: tomates, pollo, ajo, arroz..."
            className="w-full h-32 p-3 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors duration-300 text-white resize-none"
          />
          
          <div className="my-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={onOpenCamera}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Usar Cámara
              </button>
               <button
                type="button"
                onClick={handleMicClick}
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ${
                  isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening ? 'Escuchando...' : 'Usar Micrófono'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300"
            >
              Generar Receta
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="block text-lg font-semibold mb-3 text-[#D4AF37]">Filtros Dietéticos</p>
              {renderFilterButtons(dietFilters, (id) => handleSingleSelectChange(setDietFilters, id))}
            </div>
            <div>
              <p className="block text-lg font-semibold mb-3 text-[#D4AF37]">Otros Filtros</p>
              {renderFilterButtons(miscFilters, (id) => handleToggleFilter(setMiscFilters, id))}
            </div>
            <div>
              <p className="block text-lg font-semibold mb-3 text-[#D4AF37]">Nivel de Dificultad</p>
              {renderFilterButtons(difficultyFilters, (id) => handleSingleSelectChange(setDifficultyFilters, id))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientInput;
