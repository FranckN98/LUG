import React from 'react';
import Link from 'next/link';

type CardProps = {
  title: string;
  description?: string;
  imageUrl?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Card({
  title,
  description,
  imageUrl,
  href,
  children,
  className = '',
}: CardProps) {
  const content = (
    <>
      {imageUrl && (
        <div className="aspect-video sm:aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{description}</p>
        )}
        {children}
      </div>
    </>
  );

  const baseClass =
    'block rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden';

  if (href) {
    return (
      <Link href={href} className={`${baseClass} ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`${baseClass} ${className}`}>{content}</div>;
}
