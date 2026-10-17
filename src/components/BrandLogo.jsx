import React from "react";

const LOGOS = {
  horizontal: "/brand/leticia-horizontal.png",
  vertical: "/brand/leticia-vertical.png",
  icon: "/brand/leticia-icon.png",
};

export default function BrandLogo({ variant = "horizontal", className = "w-44", ...props }) {
  return <img src={LOGOS[variant] || LOGOS.horizontal} alt="Letícia Barboza · Nail Designer" className={`brand-logo brand-logo--${variant} shrink-0 ${className}`} {...props} />;
}
