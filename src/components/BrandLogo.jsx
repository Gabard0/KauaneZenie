import React from "react";

const LOGOS = {
  horizontal: "/brand/kauane-horizontal.png",
  vertical: "/brand/kauane-vertical.png",
  icon: "/brand/kauane-monogram-light.png",
};

export default function BrandLogo({ variant = "horizontal", className = "w-44", ...props }) {
  const type = LOGOS[variant] ? variant : "horizontal";
  return (
    <span className={`brand-logo brand-logo--${type} shrink-0 ${className}`}>
      <img src={LOGOS[type]} alt="Kauane Zenie · Studio de Beleza" decoding="async" {...props} />
    </span>
  );
}
