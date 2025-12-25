import { useState } from 'react';
import html2canvas from 'html2canvas';

export const useScreenshot = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const takeScreenshot = async (elementId: string, fileName: string = 'tier-list') => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Element dengan id '${elementId}' tidak ditemukan!`);
      return;
    }

    setIsDownloading(true);

    try {
      // Konfigurasi html2canvas
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#020617',
        scale: 2,
      });

      // Konversi canvas jadi URL gambar
      const image = canvas.toDataURL('image/jpeg', 1.0);

      // Trik membuat link download palsu lalu di-klik otomatis
      const link = document.createElement('a');
      link.href = image;
      link.download = `${fileName}.jpg`;
      link.click();
    } catch (error) {
      console.error('Gagal mengambil screenshot:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return { takeScreenshot, isDownloading };
};