

import React, { useState } from 'react';
import type { ShoppingListItem } from '../types';

interface ShoppingListViewProps {
  items: ShoppingListItem[];
  onToggle: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onToggleAll: () => void;
}

interface Supermarket {
  name: string;
  logoUrl: string;
  searchUrl: string;
}

const supermarkets: Supermarket[] = [
    { name: 'Mercadona', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mercadona_logo.svg/1200px-Mercadona_logo.svg.png', searchUrl: 'https://tienda.mercadona.es/search?query=' },
    { name: 'Carrefour', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3b/Logo_Carrefour.svg/1200px-Logo_Carrefour.svg.png', searchUrl: 'https://www.carrefour.es/?q=' },
    { name: 'Dia', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/DIA_logo.svg/1200px-DIA_logo.svg.png', searchUrl: 'https://www.dia.es/compra-online/search?text=' },
    { name: 'El Corte Inglés', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Logo_de_El_Corte_Ingl%C3%A9s.svg/1200px-Logo_de_El_Corte_Ingl%C3%A9s.svg.png', searchUrl: 'https://www.elcorteingles.es/supermercado/buscar/?term=' },
];

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ items, onToggle, onUpdateQuantity, onClearCompleted, onClearAll, onToggleAll }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const completedCount = items.filter(item => item.checked).length;
  const allItemsChecked = items.length > 0 && completedCount === items.length;
  
  const handleOnlineSearch = (baseUrl: string) => {
    const itemsToSearch = items.filter(item => !item.checked).map(item => item.name);
    if (itemsToSearch.length === 0) {
        alert('¡No hay ingredientes pendientes para buscar! Desmarca algunos artículos de tu lista para continuar.');
        return;
    }
    const query = itemsToSearch.join(' ');
    const encodedQuery = encodeURIComponent(query);
    const finalUrl = `${baseUrl}${encodedQuery}`;

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
    setIsSearchModalOpen(false);
  };

  const handleShareList = async () => {
    const itemsToShare = items.filter(item => !item.checked);
    if (itemsToShare.length === 0) {
        alert('¡No hay ingredientes pendientes para compartir! Añade o desmarca algunos artículos para continuar.');
        return;
    }

    const title = 'Lista de la Compra de Homsent Chef';
    const text = `${title}\n\n${itemsToShare.map(item => `- ${item.name.trim()} (${item.quantity.trim()})`).join('\n')}`;

    if (navigator.share) {
        try {
            await navigator.share({ title, text });
        } catch (error) {
            console.error('Error al compartir:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess('¡Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err)
 {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar la lista.');
        }
    }
  };


  const SearchModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsSearchModalOpen(false)}>
        <div className="bg-gray-800 border border-[#D4AF37]/50 rounded-xl shadow-2xl p-6 w-full max-w-lg animate-modal-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-center text-white mb-2">Buscar Ingredientes Online</h3>
            <p className="text-center text-gray-400 mb-6">Selecciona tu supermercado. Se abrirá una nueva pestaña con la búsqueda de tus ingredientes.</p>
            
            <div className="grid grid-cols-2 gap-4">
                {supermarkets.map(market => (
                    <button
                        key={market.name}
                        onClick={() => handleOnlineSearch(market.searchUrl)}
                        className="group flex flex-col items-center justify-center p-4 bg-gray-700 hover:bg-[#D4AF37]/10 rounded-lg border-2 border-transparent hover:border-[#D4AF37]/50 transition-all duration-300 aspect-video"
                    >
                        <img src={market.logoUrl} alt={`${market.name} logo`} className="h-12 max-w-full object-contain mb-2 invert-[.85] group-hover:invert-0 transition-all duration-300" />
                        <span className="font-semibold text-white text-center">{market.name}</span>
                    </button>
                ))}
            </div>

            <button onClick={() => setIsSearchModalOpen(false)} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Cerrar
            </button>
        </div>
    </div>
  );
  
  return (
    <>
      <div className="w-full p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
        <h2 className="text-3xl font-bold text-white mb-2">Lista de la Compra</h2>
        <p className="text-gray-400 mb-6">Aquí tienes los ingredientes que necesitas comprar.</p>
        
        {items.length > 0 ? (
          <>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-6">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center p-3 bg-gray-800 rounded-lg"
                >
                  <input
                    id={`item-check-${item.id}`}
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggle(item.id)}
                    className="h-6 w-6 rounded-md bg-gray-900 border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-gray-800 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, e.target.value)}
                    className="w-20 mx-3 p-1 text-center bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    aria-label={`Cantidad para ${item.name}`}
                  />
                  <label 
                    htmlFor={`item-check-${item.id}`}
                    className={`flex-grow text-lg cursor-pointer ${item.checked ? 'line-through text-gray-500' : 'text-white'}`}
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-700 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      Buscar Online
                  </button>
                  <button
                      onClick={handleShareList}
                      disabled={!!copySuccess}
                      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 disabled:bg-[#a1822c] disabled:scale-100"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      {copySuccess || 'Compartir Lista'}
                  </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                  <button
                      onClick={onToggleAll}
                      disabled={items.length === 0}
                      className="w-full sm:flex-1 bg-transparent hover:bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-500"
                  >
                      {allItemsChecked ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                  </button>
                  <button
                      onClick={onClearCompleted}
                      disabled={completedCount === 0}
                      className="w-full sm:flex-1 bg-transparent hover:bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-500"
                  >
                      Limpiar Completados ({completedCount})
                  </button>
              </div>
              <button
                  onClick={onClearAll}
                  className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                  Vaciar Lista
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mt-4">Tu lista de la compra está vacía</h3>
            <p className="text-gray-400 mt-2">Añade ingredientes desde una receta para verlos aquí.</p>
          </div>
        )}
      </div>
      {isSearchModalOpen && <SearchModal />}
    </>
  );
};

export default ShoppingListView;