'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

interface ImageCropperProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageUrl = URL.createObjectURL(file);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;
    const maxX = 0;
    const maxY = 0;
    const minX = container.offsetWidth - img.offsetWidth;
    const minY = container.offsetHeight - img.offsetHeight;
    setPosition({
      x: Math.min(maxX, Math.max(minX, e.clientX - dragStart.x)),
      y: Math.min(maxY, Math.max(minY, e.clientY - dragStart.y)),
    });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    const img = imageRef.current;
    const container = containerRef.current;
    const cropSize = container.offsetWidth;
    const scale = img.naturalWidth / img.offsetWidth;
    const sx = Math.abs(position.x) * scale;
    const sy = Math.abs(position.y) * scale;
    const sw = cropSize * scale;
    const sh = cropSize * scale;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 800, 800);

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
        onCrop(croppedFile);
      }
    }, 'image/jpeg', 90);
  }, [position, file, onCrop]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white p-6 max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em]">Crop Image</h3>
            <button onClick={onCancel}><HiX className="w-4 h-4" /></button>
          </div>
          <p className="text-[10px] opacity-40 mb-4">Drag the image to adjust the square crop area</p>
          <div
            ref={containerRef}
            className="w-full aspect-square bg-[#F5F5F5] overflow-hidden cursor-grab active:cursor-grabbing relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                minWidth: '100%',
                minHeight: '100%',
                maxWidth: 'none',
                maxHeight: 'none',
                width: 'auto',
                height: '100%',
              }}
              draggable={false}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={onCancel} className="flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] border border-[#DDDDDD]">Cancel</button>
            <button onClick={handleCrop} className="flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-[#1C1C1C] text-white">Crop & Upload</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
