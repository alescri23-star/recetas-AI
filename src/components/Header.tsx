
import React, { useState, useEffect } from 'react';

interface HeaderProps {
    view: string;
    onNavigateHome: () => void;
    onNavigateGallery: () => void;
    onNavigateGlobal: () => void;
    onNavigateShoppingList: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, onNavigateHome, onNavigateGallery, onNavigateGlobal, onNavigateShoppingList }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const NavButton: React.FC<{
    label: string;
    onClick: () => void;
    isActive: boolean;
  }> = ({ label, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm md:text-base ${
        isActive
          ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/50'
          : 'bg-transparent hover:bg-[#D4AF37]/10 text-[#D4AF37]'
      }`}
    >
      {label}
    </button>
  );

  const MobileNavLink: React.FC<{
    label: string;
    onClick: () => void;
    isActive: boolean;
  }> = ({ label, onClick, isActive }) => (
    <button
        onClick={() => {
            onClick();
            setIsMenuOpen(false);
        }}
        className={`w-full text-center text-2xl font-bold py-4 transition-colors duration-300 ${
            isActive ? 'text-[#D4AF37]' : 'text-gray-300 hover:text-white'
        }`}
    >
        {label}
    </button>
  );

  const renderMobileMenu = () => (
    <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in"
        onClick={() => setIsMenuOpen(false)}
    >
        <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar menú"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <nav className="flex flex-col items-center gap-6 w-full px-8">
            <MobileNavLink label="Crear Receta" onClick={onNavigateHome} isActive={view === 'input' || view === 'camera'} />
            <MobileNavLink label="Mis Recetas" onClick={onNavigateGallery} isActive={view === 'gallery'} />
            <MobileNavLink label="Explorar" onClick={onNavigateGlobal} isActive={view === 'global_gallery'} />
            <MobileNavLink label="Lista de Compra" onClick={onNavigateShoppingList} isActive={view === 'shopping_list'} />
        </nav>
    </div>
  );

  return (
    <>
      <header className="w-full bg-black/50 backdrop-blur-sm py-4 px-4 md:px-8 text-center border-b border-[#D4AF37]/50 shadow-lg flex justify-between items-center z-40 relative">
        <div 
          className="cursor-pointer"
          onClick={onNavigateHome}
          aria-label="Ir a la página de inicio"
        >
          <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37]">
            Homsent Chef AI
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 md:gap-4">
          <NavButton label="Crear Receta" onClick={onNavigateHome} isActive={view === 'input' || view === 'camera'} />
          <NavButton label="Mis Recetas" onClick={onNavigateGallery} isActive={view === 'gallery'} />
          <NavButton label="Explorar" onClick={onNavigateGlobal} isActive={view === 'global_gallery'} />
          <NavButton label="Lista de Compra" onClick={onNavigateShoppingList} isActive={view === 'shopping_list'} />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <button
                onClick={() => setIsMenuOpen(true)}
                className="text-[#D4AF37] p-2 rounded-md hover:bg-[#D4AF37]/10 transition-colors"
                aria-label="Abrir menú"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
      </header>
      {isMenuOpen && renderMobileMenu()}
    </>
  );
};

export default Header;
