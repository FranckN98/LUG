'use client';

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

const TRANSITION_MS = 300;

export type ImageLightboxNavLabels = {
  prev: string;
  next: string;
};

type ImageLightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
  /** Liste ordonnée : flèches précédent / suivant + touches ← → */
  gallery?: string[];
  onChangeSrc?: (nextSrc: string) => void;
  navLabels?: ImageLightboxNavLabels;
};

export function ImageLightbox({
  src,
  alt = '',
  onClose,
  gallery,
  onChangeSrc,
  navLabels,
}: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  /** URL affichée (conservée le temps de l’animation de sortie) */
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onChangeSrcRef = useRef(onChangeSrc);
  onChangeSrcRef.current = onChangeSrc;

  const beginClose = useCallback(() => {
    if (exiting) return;
    const u = displaySrc ?? src;
    if (!u) return;
    setExiting(true);
  }, [exiting, displaySrc, src]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Nouvelle image : uniquement quand `src` change (pas quand `exiting` change). */
  useEffect(() => {
    if (!src) return;
    setDisplaySrc(src);
    setExiting(false);
    setEntered(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [src]);

  useEffect(() => {
    if (!src && !exiting) {
      setDisplaySrc(null);
      setEntered(false);
    }
  }, [src, exiting]);

  useEffect(() => {
    if (!exiting || !displaySrc) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onCloseRef.current();
      setDisplaySrc(null);
      setExiting(false);
      setEntered(false);
    }, TRANSITION_MS);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [exiting, displaySrc]);

  const { index, canPrev, canNext, prevSrc, nextSrc } = useMemo(() => {
    const list = gallery;
    const current = src ?? displaySrc;
    if (!list?.length || !current || !onChangeSrc) {
      return { index: -1, canPrev: false, canNext: false, prevSrc: null as string | null, nextSrc: null as string | null };
    }
    const idx = list.indexOf(current);
    if (idx < 0) {
      return { index: -1, canPrev: false, canNext: false, prevSrc: null, nextSrc: null };
    }
    return {
      index: idx,
      canPrev: idx > 0,
      canNext: idx < list.length - 1,
      prevSrc: idx > 0 ? list[idx - 1]! : null,
      nextSrc: idx < list.length - 1 ? list[idx + 1]! : null,
    };
  }, [gallery, src, displaySrc, onChangeSrc]);

  const goPrev = useCallback(() => {
    if (!prevSrc || !onChangeSrcRef.current) return;
    onChangeSrcRef.current(prevSrc);
  }, [prevSrc]);

  const goNext = useCallback(() => {
    if (!nextSrc || !onChangeSrcRef.current) return;
    onChangeSrcRef.current(nextSrc);
  }, [nextSrc]);

  useEffect(() => {
    if (!displaySrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        beginClose();
        return;
      }
      if (e.key === 'ArrowLeft' && canPrev) {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === 'ArrowRight' && canNext) {
        e.preventDefault();
        goNext();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [displaySrc, beginClose, canPrev, canNext, goPrev, goNext]);

  const url = displaySrc ?? src;
  if (!mounted || typeof document === 'undefined') return null;
  if (!url) return null;

  const showBackdrop = entered && !exiting;
  const showContent = entered && !exiting;

  const prevLabel = navLabels?.prev ?? 'Previous image';
  const nextLabel = navLabels?.next ?? 'Next image';

  const navBtnClass =
    'absolute top-1/2 z-[10001] -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-0';

  const overlay = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 transition-[opacity,backdrop-filter] duration-300 ease-out ${
        showBackdrop
          ? 'bg-black/80 opacity-100 backdrop-blur-[6px]'
          : 'bg-black/80 opacity-0 backdrop-blur-none'
      }`}
      onClick={beginClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image en grand"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          beginClose();
        }}
        className={`absolute right-3 top-3 z-[10001] rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-5 sm:top-5 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Fermer"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative z-0 mx-auto flex w-full max-w-[min(100vw-1.5rem,96rem)] cursor-default items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {canPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className={`${navBtnClass} left-2 sm:left-4 ${showContent ? 'opacity-100' : 'opacity-0'}`}
            aria-label={prevLabel}
          >
            <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className={`max-h-[min(88dvh,88vh)] max-w-[min(100vw-5rem,96rem)] w-auto h-auto object-contain object-center rounded-lg shadow-2xl transition-[opacity,transform] duration-300 ease-out sm:max-w-[min(100vw-8rem,96rem)] ${
            showContent ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0'
          }`}
        />

        {canNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className={`${navBtnClass} right-2 sm:right-4 ${showContent ? 'opacity-100' : 'opacity-0'}`}
            aria-label={nextLabel}
          >
            <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {gallery && gallery.length > 1 && index >= 0 && showContent && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs tabular-nums text-white/90 backdrop-blur-sm">
          {index + 1} / {gallery.length}
        </p>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
