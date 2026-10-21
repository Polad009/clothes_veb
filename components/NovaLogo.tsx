"use client";

import { HorvvalleLogo, HorvvalleLogoProps } from "@/components/HorvvalleLogo";

export type NovaLogoProps = HorvvalleLogoProps;

/**
 * Re-export HorvvalleLogo as NovaLogo for seamless backward compatibility.
 */
export function NovaLogo(props: NovaLogoProps) {
  return <HorvvalleLogo {...props} />;
}

export default NovaLogo;
