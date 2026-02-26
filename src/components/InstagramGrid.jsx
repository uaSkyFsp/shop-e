import React from "react";

export default function InstagramGrid({ images }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {images.map((src, index) => (
        <div key={src} className="overflow-hidden rounded-2xl">
          <img
            src={src}
            alt={`Instagram preview ${index + 1}`}
            className="h-40 w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
