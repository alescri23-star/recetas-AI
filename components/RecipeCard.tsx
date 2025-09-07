
import React, { useState, useRef } from 'react';
import type { Recipe } from '../types';

// Let TypeScript know about the global variables from the CDNs
declare const jspdf: any;
declare const docx: any;
declare const PptxGenJS: any;

const HOMSENT_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAJgAmADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK-v/AP/Z';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
  onAddIngredientsToList: (ingredients: string[]) => void;
  onDelete?: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFavorite, onAddIngredientsToList, onDelete }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [exportState, setExportState] = useState({ loading: false, format: '', message: '' });
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const supportsWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      setIsAnimating(true);
      onToggleFavorite(recipe.id);
      setTimeout(() => setIsAnimating(false), 500); // Animation duration
    }
  };


  const createFileName = () => recipe.titulo.toLowerCase().replace(/\s+/g, '_');

  const getRecipeAsTextForSharing = () => {
    return `
*${recipe.titulo}*

*Descripción:*
${recipe.descripcion}

*Detalles:*
- Tiempo de Preparación: ${recipe.tiempo_preparacion}
- Tiempo de Cocción: ${recipe.tiempo_coccion}
- Coste: ${recipe.coste}
- Tipo de Dieta: ${recipe.tipo_dieta}
- Origen: ${recipe.origen}

*Ingredientes:*
${recipe.ingredientes.map(i => `- ${i}`).join('\n')}

*Utensilios:*
${recipe.utensilios.map(u => `- ${u}`).join('\n')}

*Instrucciones:*
${recipe.instrucciones.map((step, index) => `${index + 1}. ${step}`).join('\n')}
    `.trim();
  };

  const handleSocialShare = async () => {
    if (supportsWebShare) {
      try {
        await navigator.share({
          title: `Receta: ${recipe.titulo}`,
          text: getRecipeAsTextForSharing(),
        });
        setIsShareModalOpen(false); // Close modal on successful share
      } catch (error) {
        console.error('Error al usar Web Share API:', error);
      }
    }
  };


  const handleExport = async (format: 'pdf') => {
    setExportState({ loading: true, format, message: '' });

    try {
        await exportAsPdf();
        setExportState({ loading: false, format, message: '¡Descargado!' });
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      setExportState({ loading: false, format, message: 'Error' });
    }

    setTimeout(() => {
      setExportState({ loading: false, format: '', message: '' });
    }, 2000);
  };

  const exportAsPdf = async () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // --- Constants ---
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    const goldColor = '#D4AF37';
    const whiteColor = '#FFFFFF';
    const blackColor = '#000000';
    const grayColor = '#AAAAAA';
    let yPos = margin;

    // --- Helper Functions ---
    const addPageWithBackground = () => {
        doc.addPage();
        doc.setFillColor(blackColor);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = margin;
    };
    
    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
            addPageWithBackground();
            return true;
        }
        return false;
    };

    // --- Start Document ---
    doc.setFillColor(blackColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // --- LOGO ---
    const logoWidth = 40;
    const logoHeight = 40;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(HOMSENT_LOGO_BASE64, 'JPEG', logoX, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 10;
    
    // --- TITLE ---
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldColor);
    const titleLines = doc.splitTextToSize(recipe.titulo, contentWidth);
    checkPageBreak(titleLines.length * 12);
    doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += titleLines.length * 12 + 5;

    // --- DESCRIPTION ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(whiteColor);
    const descLines = doc.splitTextToSize(recipe.descripcion, contentWidth * 0.9);
    checkPageBreak(descLines.length * 6);
    doc.text(descLines, pageWidth / 2, yPos, { align: 'center'});
    yPos += descLines.length * 6 + 10;

    // --- DETAILS (IMPROVED) ---
    checkPageBreak(16); // For line + spacing
    doc.setDrawColor(goldColor);
    doc.line(margin, yPos, pageWidth - margin, yPos); // Horizontal line
    yPos += 8;
    
    const detailLineHeight = 6;
    const detailLabelWidth = 45;
    const detailValueWidth = contentWidth - detailLabelWidth - 2;

    const details = [
        { label: 'Tiempo de Preparación', value: recipe.tiempo_preparacion },
        { label: 'Tiempo de Cocción', value: recipe.tiempo_coccion },
        { label: 'Coste', value: recipe.coste },
        { label: 'Tipo de Dieta', value: recipe.tipo_dieta },
        { label: 'Origen', value: recipe.origen },
    ];

    details.forEach(detail => {
        const valueLines = doc.splitTextToSize(detail.value || 'N/A', detailValueWidth);
        const neededHeight = valueLines.length * detailLineHeight;
        
        checkPageBreak(neededHeight + 2); // Check for the whole detail block + spacing

        doc.setFontSize(11);
        doc.setTextColor(whiteColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, margin, yPos);

        doc.setTextColor(grayColor);
        doc.setFont('helvetica', 'normal');
        doc.text(valueLines, margin + detailLabelWidth, yPos);
        
        yPos += neededHeight + 2;
    });
    
    yPos += 6;
    checkPageBreak(12); // For line + spacing
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 12;

    // --- Helper for lists (IMPROVED) ---
    const renderList = (title: string, items: string[], isNumbered = false) => {
      checkPageBreak(15); // Title + space
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(goldColor);
      doc.text(title, margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(whiteColor);
      const lineHeight = 6;
      const itemSpacing = 3;

      if (!items || items.length === 0) {
          checkPageBreak(lineHeight);
          doc.setFont('helvetica', 'italic').setTextColor(grayColor);
          doc.text('No especificado.', margin + 2, yPos);
          yPos += lineHeight;
      } else {
          items.forEach((item, index) => {
              const prefix = isNumbered ? `${index + 1}. ` : '• ';
              const textWidth = contentWidth - (isNumbered ? 5 : 2);
              const lines = doc.splitTextToSize(`${prefix}${item}`, textWidth);

              lines.forEach((line: string) => {
                  checkPageBreak(lineHeight);
                  doc.text(line, margin + (isNumbered ? 5 : 2), yPos);
                  yPos += lineHeight;
              });

              yPos += itemSpacing;
          });
      }
      yPos += 8;
    }

    renderList('Ingredientes', recipe.ingredientes);
    renderList('Utensilios', recipe.utensilios);
    renderList('Instrucciones', recipe.instrucciones, true);

    // --- FOOTER on each page ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(grayColor);
        doc.text(
            `Receta generada por Homsent Chef AI - Página ${i} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 7,
            { align: 'center' }
        );
    }

    doc.save(`${createFileName()}.pdf`);
  };
  
  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url || !url.trim().toLowerCase().startsWith('http')) {
        console.warn("Attempted to embed an invalid video URL:", url);
        return null;
    }
    
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      console.error("Invalid video URL:", url, e);
      return null;
    }
  };

  const embedUrl = recipe.video_url ? getYoutubeEmbedUrl(recipe.video_url) : null;

  const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold px-3 py-1 rounded-full">
      {children}
    </span>
  );

  const ShareModal = () => {
    const ActionButton: React.FC<{
        onClick?: () => void;
        children: React.ReactNode;
    }> = ({ onClick, children }) => {
        return (
            <button onClick={onClick} className="w-full group flex items-center p-4 bg-gray-700 hover:bg-[#D4AF37]/10 rounded-lg border-2 border-transparent hover:border-[#D4AF37]/50 transition-all duration-300">
                {children}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsShareModalOpen(false)}>
            <div className="bg-gray-800 border border-[#D4AF37]/50 rounded-xl shadow-2xl p-6 w-full max-w-md animate-modal-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-center text-white mb-2">Compartir Receta</h3>
                <p className="text-center text-gray-400 mb-6">Comparte esta deliciosa receta.</p>
                
                <div className="space-y-3 mt-6">
                  {supportsWebShare && (
                      <ActionButton onClick={handleSocialShare}>
                        <div className="text-[#D4AF37] mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        </div>
                        <span className="font-semibold text-white text-left">Compartir vía Dispositivo...</span>
                      </ActionButton>
                  )}
                  <ActionButton onClick={() => handleExport('pdf')}>
                    <div className="text-[#D4AF37] mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                     <span className="font-semibold text-white text-left">
                       {exportState.loading && exportState.format === 'pdf' ? 'Generando PDF...' : 'Descargar como PDF'}
                     </span>
                  </ActionButton>
                </div>
                <button onClick={() => setIsShareModalOpen(false)} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Cerrar
                </button>
            </div>
        </div>
    );
  };

  const DeleteConfirmationModal = () => (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
        onClick={() => setIsDeleteModalOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
    >
        <div 
            className="bg-gray-800 border border-[#D4AF37]/50 rounded-xl shadow-2xl p-6 w-full max-w-md animate-modal-in" 
            onClick={e => e.stopPropagation()}
        >
            <h3 id="delete-modal-title" className="text-2xl font-bold text-center text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-center text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar permanentemente la receta <strong className="text-white">"{recipe.titulo}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4 mt-6">
                <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => {
                        if (onDelete) {
                            onDelete(recipe.id);
                        }
                        setIsDeleteModalOpen(false);
                    }}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Eliminar
                </button>
            </div>
        </div>
    </div>
  );

  const renderList = (title: string, items: string[], isNumbered = false) => (
    <div>
      <h3 className="text-xl font-bold text-[#D4AF37] mb-3 flex items-center gap-3">
        {title}
        {title === 'Ingredientes' && (
          <button 
            onClick={() => onAddIngredientsToList(recipe.ingredientes)}
            className="text-sm bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#D4AF37] font-semibold px-3 py-1 rounded-full transition-colors"
            title="Añadir todos los ingredientes a la lista de la compra"
          >
            Añadir todo a la compra
          </button>
        )}
      </h3>
      <ul className={`list-inside space-y-2 ${isNumbered ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, index) => (
          <li key={index} className="text-gray-300">{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div ref={cardContentRef} className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-white mb-2 pr-4">{recipe.titulo}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onToggleFavorite && (
                <button
                    onClick={handleFavoriteClick}
                    className={`p-2 rounded-full transition-colors duration-300 ${isAnimating ? 'animate-heart-pop' : ''} ${recipe.favorito ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    aria-label={recipe.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={recipe.favorito ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
              )}
              {onDelete && (
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-red-800 hover:text-white transition-colors duration-300"
                    aria-label="Eliminar receta"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
              )}
               <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-300"
                    aria-label="Compartir o exportar receta"
               >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
               </button>
            </div>
          </div>
          <p className="text-gray-400 italic mb-6">{recipe.descripcion}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Tag>Coste: {recipe.coste}</Tag>
            <Tag>Dieta: {recipe.tipo_dieta}</Tag>
            <Tag>Origen: {recipe.origen}</Tag>
            <Tag>Preparación: {recipe.tiempo_preparacion}</Tag>
            <Tag>Cocción: {recipe.tiempo_coccion}</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderList('Ingredientes', recipe.ingredientes)}
            {renderList('Utensilios', recipe.utensilios)}
          </div>
          
          {embedUrl && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-3">Vídeo Tutorial</h3>
              <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-700">
                <iframe
                  className="w-full h-full"
                  src={embedUrl}
                  title={`Vídeo tutorial para: ${recipe.titulo}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="mt-8">
            {renderList('Instrucciones', recipe.instrucciones, true)}
          </div>
        </div>
      </div>
      {isShareModalOpen && <ShareModal />}
      {isDeleteModalOpen && <DeleteConfirmationModal />}
    </>
  );
};

export default RecipeCard;
