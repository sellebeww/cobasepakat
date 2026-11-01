/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

// Vector redraw of the hero visual from the asset pack (the pack only ships a 470px JPG crop).
// Motion respects the user's reduced-motion setting through MotionConfig in App.
const center = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

const float = (distance: number, duration: number, delay = 0) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' as const },
});

const NAVY = '#173B73';
const SKIN = '#F8C9A8';
const SKIN_SHADE = '#E9A982';
const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export const HeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 520 440"
    className={className}
    role="img"
    aria-label="Ilustrasi tiga warga berdiskusi di depan layar berisi pertanyaan: apakah perlu menambah jam operasional pos keamanan di kluster kita? dengan tombol Uji dengan Percobaan"
  >
    <defs>
      <linearGradient id="hi-blob" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#D9ECFF" />
        <stop offset="1" stopColor="#E8FBF5" />
      </linearGradient>
            <linearGradient id="hi-fade-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.86" stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <mask id="hi-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="440">
        <rect width="520" height="440" fill="url(#hi-fade-grad)" />
      </mask>
      <filter id="hi-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor={NAVY} floodOpacity="0.16" />
      </filter>
    </defs>

    {/* Backdrop blob */}
    <motion.path
      d="M24 250C0 140 96 40 220 28s250 24 272 124-24 188-124 224S54 372 24 250Z"
      fill="url(#hi-blob)"
      style={center}
      animate={{ scale: [1, 1.03, 1], rotate: [0, 2, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Sparks, top right */}
    <motion.g
      stroke="#27B58D"
      strokeWidth="5"
      strokeLinecap="round"
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M452 36l18 9" />
      <path d="M458 18l14-2" />
      <path d="M444 54l10 13" />
    </motion.g>
    <path d="M478 112l6 14M470 124l16-6" stroke="#2476E8" strokeWidth="3" strokeLinecap="round" opacity=".5" />

    {/* Bubbles behind the window */}
    <motion.g {...float(9, 4.2)}>
      <path d="M22 70a14 14 0 0 1 14-14h60a14 14 0 0 1 14 14v36a14 14 0 0 1-14 14H64l-18 16v-16h-10a14 14 0 0 1-14-14Z" fill="#D9ECFF" />
      <rect x="40" y="76" width="56" height="7" rx="3.5" fill="#fff" />
      <rect x="40" y="92" width="38" height="7" rx="3.5" fill="#fff" />
    </motion.g>
    <motion.g {...float(8, 5, 0.8)}>
      <path d="M50 158a14 14 0 0 1 14-14h58a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14h-8v16l-18-16H64a14 14 0 0 1-14-14Z" fill="#2476E8" />
      <rect x="68" y="162" width="56" height="7" rx="3.5" fill="#fff" />
      <rect x="68" y="178" width="38" height="7" rx="3.5" fill="#fff" />
    </motion.g>
    <motion.g {...float(7, 4.6, 0.4)}>
      <path d="M424 120a14 14 0 0 1 14-14h50a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14h-6v14l-16-14h-28a14 14 0 0 1-14-14Z" fill="#D9ECFF" />
      <rect x="440" y="126" width="46" height="7" rx="3.5" fill="#fff" />
      <rect x="440" y="142" width="32" height="7" rx="3.5" fill="#fff" />
    </motion.g>

    {/* Browser window */}
    <motion.g {...float(5, 6)}>
      <g transform="rotate(-4 270 140)" filter="url(#hi-shadow)">
        <rect x="118" y="38" width="306" height="218" rx="18" fill="#fff" stroke="#DCE9F8" />
        <path d="M118 58a20 20 0 0 1 20-20h266a20 20 0 0 1 20 20v8H118Z" fill="#2476E8" />
        <circle cx="138" cy="52" r="3.6" fill="#fff" />
        <circle cx="151" cy="52" r="3.6" fill="#fff" opacity=".8" />
        <circle cx="164" cy="52" r="3.6" fill="#fff" opacity=".6" />

        <image href="/brand/cobasepakat-emblem-nobg.png" x="138" y="84" width="40" height="40" />
        <g fill={NAVY} fontWeight="800" fontSize="14.5" fontFamily={FONT}>
          <text x="190" y="108">Apakah perlu menambah</text>
          <text x="190" y="130">jam operasional pos keamanan</text>
          <text x="190" y="152">di kluster kita?</text>
        </g>

        {/* CTA pill, pulsing */}
        <motion.g
          style={center}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="158" y="180" width="232" height="46" rx="23" fill="#159A78" />
          <g transform="translate(182 192)" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1h8M7 1v7l-4.3 7A1.5 1.5 0 0 0 4 17.5h8a1.5 1.5 0 0 0 1.3-2.5L9 8V1M5 12h8" />
          </g>
          <text x="214" y="208" fill="#fff" fontWeight="700" fontSize="14" fontFamily={FONT}>
            Uji dengan Percobaan
          </text>
        </motion.g>
      </g>
    </motion.g>

    {/* Characters fade out at the bottom instead of being cut flat */}
    <g mask="url(#hi-fade)">
      {/* ── Middle person, from behind ── */}
      <g transform="translate(20 10)">
        <path d="M190 440c0-50 32-80 80-80s80 30 80 80Z" fill="#3E6FB5" />
        <path d="M244 364l26 24 26-24Z" fill="#2F5A9A" />
        <path d="M254 336h32l4 30c-12 10-28 10-40 0Z" fill={SKIN_SHADE} />
        <ellipse cx="270" cy="326" rx="40" ry="42" fill={NAVY} />
        <path d="M238 312c14-18 50-18 64 0" fill="none" stroke="#2A5599" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        <path d="M242 344c8 10 48 10 56 0" fill="none" stroke="#0F2A55" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        <ellipse cx="230" cy="338" rx="6" ry="8" fill={SKIN_SHADE} />
        <ellipse cx="310" cy="338" rx="6" ry="8" fill={SKIN_SHADE} />
      </g>

      {/* ── Woman (left): long side-parted hair, pointing up at the screen ── */}
      <g>
        {/* back hair: falls behind the shoulders */}
        <path d="M84 300C80 256 100 244 124 244c26 0 42 18 38 56-2 28 6 52 14 74H70c10-22 16-46 14-74Z" fill={NAVY} />
        {/* neck, then the torso with a scooped neckline over it */}
        <path d="M110 322h26v50h-26Z" fill={SKIN_SHADE} />
        <path d="M30 440c0-46 32-76 74-82q19 24 38 0c46 6 76 36 76 82Z" fill="#2476E8" />
        <path d="M30 440c0-26 8-46 24-62-5 20-4 42 2 62Z" fill="#1B5FC4" opacity=".5" />
        {/* raised arm: sleeve grows out of the shoulder */}
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: '0% 100%' }}
          animate={{ rotate: [0, -3, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M168 372c30-4 44-22 48-52l4-30c1-9 8-14 17-13 9 1 15 8 14 17l-6 40c-6 46-36 76-80 78Z" fill="#2476E8" />
          <path d="M218 300c8 4 24 4 32 0" fill="none" stroke="#1B5FC4" strokeWidth="4" strokeLinecap="round" opacity=".55" />
          {/* hand: palm, curled fingers, pointing index, thumb */}
          {/* hand scaled about the wrist so it stays attached to the cuff */}
          <g transform="translate(236 300) scale(.82) translate(-236 -300)">
          <g transform="rotate(8 239 281)">
            <rect x="222" y="266" width="34" height="34" rx="14" fill={SKIN} />
            {/* index sits on the thumb side, not centred, so it never reads as a middle finger */}
            <rect x="223" y="226" width="10.5" height="48" rx="5.25" fill={SKIN} />
            <ellipse cx="228.25" cy="231.5" rx="3.2" ry="3.6" fill="#FBE3D3" opacity=".8" />
            <path d="M225 252h6" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
            {/* middle, ring and pinky folded over the palm, knuckles showing */}
            <rect x="234" y="259" width="8" height="15" rx="4" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.4" />
            <rect x="241.5" y="260" width="7.5" height="14" rx="3.75" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.4" />
            <rect x="248.5" y="262" width="7" height="12" rx="3.5" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.4" />
            <path d="M236 280h17" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
          </g>
          <ellipse cx="222" cy="285" rx="6.5" ry="10" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.2" transform="rotate(-24 222 285)" />
          </g>
        </motion.g>
        {/* head */}
        <ellipse cx="123" cy="300" rx="30" ry="34" fill={SKIN} />
        {/* front hair: smooth fringe swept from a side part, hair hugs both temples */}
        <path d="M91 298C84 266 102 252 126 252c26 0 38 18 33 52-1-22-10-38-23-46C122 264 98 276 91 298Z" fill={NAVY} />
        <path d="M110 259c8-5 18-6 26-2-8 0-18 2-26 2Z" fill="#2A5599" opacity=".6" />
        {/* face: brows, eyes, nose, smile, blush */}
        <path d="M104 291q6-4 12-1M130 290q6-4 12 0" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="111" cy="301" rx="3" ry="3.4" fill={NAVY} />
        <ellipse cx="137" cy="301" rx="3" ry="3.4" fill={NAVY} />
        <path d="M124 304q4 5 0 8" fill="none" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" />
        <path d="M112 317q12 10 24 0" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="104" cy="313" r="5.5" fill="#F4A590" opacity=".5" />
        <circle cx="143" cy="313" r="5.5" fill="#F4A590" opacity=".5" />
      </g>

      {/* ── Man (right): green tee, facing the screen ── */}
      <g>
        <path d="M352 440c2-50 32-82 74-82s72 32 76 82Z" fill="#2FAE78" />
        <path d="M352 440c2-26 12-48 26-60-4 22-2 42 4 60Z" fill="#1F9462" opacity=".5" />
        <path d="M414 330h34l4 28c-12 14-34 14-46 0Z" fill={SKIN_SHADE} />
        <path d="M404 360q22 22 44 0z" fill="#27996A" />
        {/* hair at the back of the head */}
        <path d="M446 288c18 6 22 36 8 56-2-20-4-40-8-56Z" fill={NAVY} />
        {/* head turned toward the screen */}
        <ellipse cx="426" cy="310" rx="32" ry="37" fill="#F2B993" />
        <ellipse cx="454" cy="318" rx="6" ry="8" fill={SKIN_SHADE} />
        {/* hair: swept back with volume */}
        <path d="M392 312c-10-40 28-58 62-36 10 7 12 20 8 30-6-12-14-18-26-20-18-3-32 6-44 26Z" fill={NAVY} />
        <path d="M416 272c14-6 32-2 38 10-14-8-26-8-38-10Z" fill="#2A5599" opacity=".6" />
        {/* features */}
        <path d="M402 300q6-5 12-1M428 300q6-5 12-1" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="409" cy="309" rx="3" ry="3.4" fill={NAVY} />
        <ellipse cx="435" cy="309" rx="3" ry="3.4" fill={NAVY} />
        <path d="M398 312q-5 8-1 14" fill="none" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" />
        <path d="M404 328q14 12 28 0" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="402" cy="322" r="6.5" fill="#F4A590" opacity=".5" />
        <circle cx="442" cy="322" r="6.5" fill="#F4A590" opacity=".45" />
      </g>
    </g>

    {/* Small bubble between the characters */}
    <motion.g {...float(6, 3.8, 1.2)}>
      <path d="M326 296a10 10 0 0 1 10-10h38a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10h-4v12l-14-12h-20a10 10 0 0 1-10-10Z" fill="#D9ECFF" />
      <rect x="336" y="296" width="32" height="5" rx="2.5" fill="#fff" />
      <rect x="336" y="307" width="22" height="5" rx="2.5" fill="#fff" />
    </motion.g>
  </svg>
);
