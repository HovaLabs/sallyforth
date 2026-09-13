const PATHS = {
  blog: 'M0,32 C150,64 300,0 450,28 C600,56 750,8 900,30 C1050,52 1150,20 1200,28 L1200,60 L0,60 Z',
  store: 'M0,28 C160,58 320,4 480,26 C640,48 800,10 960,30 C1080,44 1150,22 1200,26 L1200,60 L0,60 Z',
  footer: 'M0,20 C200,60 400,0 600,30 C800,60 1000,0 1200,24 L1200,60 L0,60 Z',
} as const;

const FILLS = {white: 'var(--white)', cream: 'var(--cream)'} as const;

/** Sits at the top edge of a section and waves into the section above it. */
export function WaveDivider({variant, fill}: {variant: keyof typeof PATHS; fill: keyof typeof FILLS}) {
  return (
    <svg className="sf-wave" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
      <path fill={FILLS[fill]} d={PATHS[variant]} />
    </svg>
  );
}
