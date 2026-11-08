/**
 * Tier 1 Feature Tests: Ambient Video Hero & Storefront Luxury Atmosphere
 * Covers: components/HeroVideo.tsx, components/Hero.tsx, components/Header.tsx,
 *         components/ProductCard.tsx, app/globals.css, public/videos/, public/images/hero/
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import {
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  readProjectFile,
  projectFileExists,
  PROJECT_ROOT,
} from '../helpers/test-context.mjs';

describe('Storefront Video Hero & Luxury Visual Atmosphere', () => {
  const heroVideoCode = projectFileExists('components/HeroVideo.tsx')
    ? readProjectFile('components/HeroVideo.tsx')
    : readProjectFile('components/Hero.tsx');

  const headerCode = readProjectFile('components/Header.tsx');
  const productCardCode = readProjectFile('components/ProductCard.tsx');
  const globalsCss = readProjectFile('app/globals.css');

  test('FEAT-HERO-01.1: HeroVideo implements HeroVideoProps contract interface', () => {
    assert(
      heroVideoCode.includes('interface HeroVideoProps') || heroVideoCode.includes('type HeroVideoProps'),
      'Must declare HeroVideoProps interface'
    );
    assertContains(heroVideoCode, 'posterDesktop', 'HeroVideoProps must require posterDesktop');
    assertContains(heroVideoCode, 'posterMobile', 'HeroVideoProps must require posterMobile');
    assertContains(heroVideoCode, 'videoDesktopSrc', 'HeroVideoProps must require videoDesktopSrc');
    assertContains(heroVideoCode, 'videoMobileSrc', 'HeroVideoProps must require videoMobileSrc');
    assertContains(heroVideoCode, 'ctaText', 'HeroVideoProps must require ctaText');
    assertContains(heroVideoCode, 'ctaLink', 'HeroVideoProps must require ctaLink');
  });

  test('FEAT-HERO-01.2: Dual-cut responsive video sources (16:9 desktop & 9:16 mobile)', () => {
    // Mobile cut: <source media="(max-width: 767px)" ... />
    assertMatches(
      heroVideoCode,
      /source[\s\S]*?media=["']\(max-width:\s*767px\)["'][\s\S]*?src=\{?(?:videoMobileSrc|mobileVideoSrc|posterMobile)\}?|source[\s\S]*?src=\{?(?:videoMobileSrc|mobileVideoSrc)\}?[\s\S]*?media=["']\(max-width:\s*767px\)["']/,
      'Video element must contain media query for mobile (max-width: 767px)'
    );
    // Desktop cut: <source src={videoDesktopSrc} type="video/mp4" />
    assertMatches(
      heroVideoCode,
      /source[\s\S]*?src=\{?(?:videoDesktopSrc|desktopVideoSrc)\}?[\s\S]*?type=["']video\/mp4["']|source[\s\S]*?type=["']video\/mp4["'][\s\S]*?src=\{?(?:videoDesktopSrc|desktopVideoSrc)\}?/,
      'Video element must declare desktop MP4 source'
    );
  });

  test('FEAT-HERO-01.3: High-priority WebP picture poster fallback preventing CLS layout shifts', () => {
    assertContains(heroVideoCode, '<picture', 'HeroVideo must include <picture> element for responsive poster fallbacks');
    assertMatches(
      heroVideoCode,
      /fetchPriority=["']high["']|priority/,
      'Poster image must specify high priority fetch to eliminate First Contentful Paint delay'
    );
    assertMatches(
      heroVideoCode,
      /type=["']image\/webp["']|srcSet=\{?posterMobile\}?/,
      'Poster picture must provide optimized WebP source for mobile'
    );
  });

  test('FEAT-HERO-01.4: Zero-flash opacity transition on playback start', () => {
    assertMatches(
      heroVideoCode,
      /onPlaying\s*=|addEventListener\s*\(\s*["']playing["']/,
      'Video must attach onPlaying listener to synchronize smooth opacity reveal'
    );
    assertMatches(
      heroVideoCode,
      /opacity-0[\s\S]*?opacity-100|transition-opacity/,
      'Video must use CSS transition-opacity to fade in smoothly over poster without black frames'
    );
  });

  test('FEAT-HERO-01.5: Battery & GPU conservation via IntersectionObserver (<20% visibility auto-pause)', () => {
    assertContains(
      heroVideoCode,
      'IntersectionObserver',
      'HeroVideo must implement IntersectionObserver to monitor viewport presence'
    );
    assertMatches(
      heroVideoCode,
      /0\.2|threshold/,
      'IntersectionObserver must configure threshold for pausing when <20% visible'
    );
    assertMatches(
      heroVideoCode,
      /video\.pause\(\)|videoRef\.current\.pause\(\)/,
      'IntersectionObserver must pause video playback when scrolled off-screen'
    );
  });

  test('FEAT-HERO-01.6: Tab visibility and prefers-reduced-motion resilience', () => {
    assertContains(
      heroVideoCode,
      'visibilitychange',
      'HeroVideo must listen to visibilitychange to pause video when user switches tabs'
    );
    assertMatches(
      heroVideoCode,
      /prefers-reduced-motion|matchMedia/,
      'HeroVideo must respect user operating system prefers-reduced-motion settings'
    );
  });

  test('FEAT-HERO-01.7: Accessible video pause/play micro-capsule toggle button (WCAG 2.2.2)', () => {
    assertMatches(
      heroVideoCode,
      /aria-label=["'][^"']*(?:pauz|pause|videon|video)[^"']*["']/i,
      'Video control toggle must provide accessible aria-label'
    );
    assertMatches(
      heroVideoCode,
      /togglePlay|onClick=/,
      'Must contain interactive pause/play trigger'
    );
  });

  test('FEAT-HERO-01.8: Local media asset presence in public/images/hero and public/videos', () => {
    const posterTallWebp = path.join(PROJECT_ROOT, 'public/images/hero/hero-poster-tall.webp');
    const posterWideWebp = path.join(PROJECT_ROOT, 'public/images/hero/hero-poster-wide.webp');
    const posterTallJpg = path.join(PROJECT_ROOT, 'public/images/hero/hero-poster-tall.jpg');
    const posterWideJpg = path.join(PROJECT_ROOT, 'public/images/hero/hero-poster-wide.jpg');
    const videosDir = path.join(PROJECT_ROOT, 'public/videos');

    const hasTallPoster = fs.existsSync(posterTallWebp) || fs.existsSync(posterTallJpg);
    const hasWidePoster = fs.existsSync(posterWideWebp) || fs.existsSync(posterWideJpg);

    assert(hasTallPoster, 'Mobile hero poster asset must exist in public/images/hero/');
    assert(hasWidePoster, 'Desktop hero poster asset must exist in public/images/hero/');
    assert(fs.existsSync(videosDir), 'public/videos/ directory must exist');
  });

  test('FEAT-HERO-01.9: Storefront Atelier Obsidian color tokens in globals.css', () => {
    assertMatches(
      globalsCss,
      /--atelier-(?:noir|bg)|#090A0[EF]|#08090[Dd]/,
      'globals.css must define obsidian/noir/atelier base palette token'
    );
    assertMatches(
      globalsCss,
      /--atelier-gold|#E6C280|#D4AF37/,
      'globals.css must define luxury champagne gold token'
    );
  });

  test('FEAT-HERO-01.10: ProductCard visual consistency and aspect ratio stability', () => {
    assertContains(productCardCode, 'aspect-[3/4]', 'ProductCard must maintain consistent aspect-[3/4] ratio');
    assertMatches(
      productCardCode,
      /transition|duration-/,
      'ProductCard must use smooth transitions for hover interactions'
    );
  });
});
